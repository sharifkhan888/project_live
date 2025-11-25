from django.core.management.base import BaseCommand
from poll.models import Candidate

class Command(BaseCommand):
    help = 'Populate initial candidates for the voting poll'

    def handle(self, *args, **options):
        candidates_data = [
            {
                'id': 1,
                'name': 'ॲड. शोएब शेख',
                'party': 'राष्ट्रवादी काँग्रेस पार्टी',
                'display_order': 3
            },
            {
                'name': 'युसुफ खान उस्मान खान',
                'party': 'कांग्रेस',
                'display_order': 1
            },
            {
                'name': 'शेख इमरान शेख गुलाब',
                'party': 'MIM',
                'display_order': 2
            },
            {
                'name': 'खान जाफर अफसर खान',
                'party': 'BJP',
                'display_order': 4
            },
            {
                'name': 'नासिर अब्दुल रज्जाक',
                'party': 'अपक्ष',
                'display_order': 5
            }
        ]

        for candidate_data in candidates_data:
            candidate, created = Candidate.objects.update_or_create(
                id=candidate_data.get('id'),
                defaults=candidate_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created candidate: {candidate.name}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Updated candidate: {candidate.name}")
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully populated candidates')
        )