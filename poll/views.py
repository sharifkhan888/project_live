from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Sum, F, Case, When, Value, IntegerField, Q
from django.shortcuts import render
from .models import Candidate, Vote, VoteCount, SiteSettings
from .serializers import CandidateSerializer, VoteCountSerializer
import logging

logger = logging.getLogger(__name__)

# Lead candidate ID (ॲड. शोएब शेख)
LEAD_CANDIDATE_ID = 1

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def home(request):
    """Render index.html with Open Graph context from SiteSettings"""
    settings = SiteSettings.get_solo()
    og_title = (settings.title or 'प्रभाग क्र. 8 – ब: में जनता के').strip()
    og_description = (settings.description or 'नगरसेवक के लिए सर्वश्रेष्ठ उम्मीदवार कौन?').strip()
    og_image = (settings.image_url or '/static/img/parties/congress.png').strip()
    og_url = request.build_absolute_uri('/')
    context = {
        'og_title': og_title,
        'og_description': og_description,
        'og_image': og_image,
        'og_url': og_url,
        'og_site_name': settings.site_name or 'Ward 8-B Poll',
        'og_locale': 'hi_IN',
    }
    return render(request, 'index.html', context)

@api_view(['POST'])
def cast_vote(request):
    """
    Cast a vote enforcing one vote per user (IP):
    - Single vote allowed per IP
    - Non-lead candidate: +1 to candidate; every second distinct vote for the same
      candidate gives the lead candidate +1 bonus
    - Lead candidate direct vote: only +1 to lead (no bonus)
    """
    try:
        candidate_id = request.data.get('candidate_id')
        if not candidate_id:
            return Response({
                'success': False,
                'error': 'Candidate ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        candidate_id = int(candidate_id)

        ip_address = get_client_ip(request)

        try:
            candidate = Candidate.objects.get(id=candidate_id)
        except Candidate.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Invalid candidate'
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            existing_votes = list(Vote.objects.filter(ip_address=ip_address).order_by('vote_index'))
            if len(existing_votes) >= 1:
                return Response({
                    'success': False,
                    'error': 'You have already voted'
                }, status=status.HTTP_400_BAD_REQUEST)

            vote_index = 1
            Vote.objects.create(ip_address=ip_address, candidate=candidate, vote_index=vote_index)

            def ensure_count(cid):
                vc, _ = VoteCount.objects.get_or_create(
                    candidate_id=cid,
                    defaults={'total_votes': 0, 'actual_votes': 0, 'boosted_votes': 0}
                )
                return vc

            vc = ensure_count(candidate_id)
            vc.total_votes += 1
            vc.actual_votes += 1
            vc.save()

            if candidate_id != LEAD_CANDIDATE_ID:
                if vc.actual_votes % 2 == 0:
                    lead_vc = ensure_count(LEAD_CANDIDATE_ID)
                    lead_vc.total_votes += 1
                    lead_vc.boosted_votes += 1
                    lead_vc.save()

        logger.info(f"Vote cast successfully (#{vote_index}) from IP {ip_address} for candidate {candidate.name}")

        return Response({'success': True, 'message': 'Vote recorded successfully'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error casting vote: {str(e)}")
        return Response({'success': False, 'error': 'An error occurred while processing your vote'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_results(request):
    """
    Get voting results with percentages and total votes
    """
    try:
        order_case = Case(
            When(Q(name__icontains='युसुफ खान उस्मान खान') & Q(party__in=['कांग्रेस','Congress']), then=Value(1)),
            When(Q(name__icontains='शेख इमरान शेख गुलाब') & Q(party__in=['MIM','एआईएम']), then=Value(2)),
            When(Q(name__icontains='ॲड. शोएब शेख') & Q(party__in=['NCP','राष्ट्रवादी काँग्रेस पार्टी']), then=Value(3)),
            When(Q(name__icontains='खान जाफर अफसर खान') & Q(party__in=['BJP','भाजपा']), then=Value(4)),
            When(Q(name__icontains='नासिर अब्दुल रज्जाक') & Q(party__in=['Independent','अपक्ष']), then=Value(5)),
            default=Value(100),
            output_field=IntegerField()
        )
        candidates = Candidate.objects.annotate(custom_order=order_case).order_by('custom_order', 'display_order', 'name')
        # Aggregate by candidate name to avoid duplicates in results
        aggregated = {}
        
        # Calculate total votes
        total_votes = VoteCount.objects.aggregate(
            total=Sum('total_votes')
        )['total'] or 0
        
        for candidate in candidates:
            vote_count = VoteCount.objects.filter(candidate=candidate).first()
            votes = vote_count.total_votes if vote_count else 0
            actual_votes = vote_count.actual_votes if vote_count else 0
            boosted_votes = vote_count.boosted_votes if vote_count else 0

            key = (candidate.name or '').strip()
            if key not in aggregated:
                aggregated[key] = {
                    'id': candidate.id,
                    'name': candidate.name,
                    'party': candidate.party,
                    'votes': votes,
                    'actual_votes': actual_votes,
                    'boosted_votes': boosted_votes
                }
            else:
                aggregated[key]['votes'] += votes
                aggregated[key]['actual_votes'] += actual_votes
                aggregated[key]['boosted_votes'] += boosted_votes

        # Compute percentages after aggregation
        results = []
        for item in aggregated.values():
            percentage = round((item['votes'] / total_votes * 100), 1) if total_votes > 0 else 0.0
            item['percentage'] = percentage
            results.append(item)
        
        return Response({
            'success': True,
            'total_votes': total_votes,
            'candidates': results
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting results: {str(e)}")
        return Response({
            'success': False,
            'error': 'An error occurred while fetching results'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_candidates(request):
    """
    Get all candidates for display
    """
    try:
        order_case = Case(
            When(Q(name__icontains='युसुफ खान उस्मान खान') & Q(party__in=['कांग्रेस','Congress']), then=Value(1)),
            When(Q(name__icontains='शेख इमरान शेख गुलाब') & Q(party__in=['MIM','एआईएम']), then=Value(2)),
            When(Q(name__icontains='ॲड. शोएब शेख') & Q(party__in=['NCP','राष्ट्रवादी काँग्रेस पार्टी']), then=Value(3)),
            When(Q(name__icontains='खान जाफर अफसर खान') & Q(party__in=['BJP','भाजपा']), then=Value(4)),
            When(Q(name__icontains='नासिर अब्दुल रज्जाक') & Q(party__in=['Independent','अपक्ष']), then=Value(5)),
            default=Value(100),
            output_field=IntegerField()
        )
        candidates = Candidate.objects.annotate(custom_order=order_case).order_by('custom_order', 'display_order', 'name')
        serializer = CandidateSerializer(candidates, many=True)
        
        return Response({
            'success': True,
            'candidates': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting candidates: {str(e)}")
        return Response({
            'success': False,
            'error': 'An error occurred while fetching candidates'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
