from rest_framework import serializers
from django.db import models
from .models import Candidate, Vote, VoteCount

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = ['id', 'name', 'party', 'display_order']

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'ip_address', 'candidate', 'timestamp']
        read_only_fields = ['ip_address', 'timestamp']

class VoteCountSerializer(serializers.ModelSerializer):
    candidate = CandidateSerializer(read_only=True)
    votes = serializers.IntegerField(source='total_votes')
    percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = VoteCount
        fields = ['candidate', 'votes', 'percentage', 'actual_votes', 'boosted_votes']
    
    def get_percentage(self, obj):
        total_votes = VoteCount.objects.aggregate(
            total=models.Sum('total_votes')
        )['total'] or 0
        
        if total_votes == 0:
            return 0.0
        
        return round((obj.total_votes / total_votes) * 100, 1)