from django.core.management.base import BaseCommand
from django.db import transaction
from poll.models import Candidate, Vote, VoteCount
import sqlite3
from datetime import datetime

class Command(BaseCommand):
    def handle(self, *args, **options):
        conn = sqlite3.connect('db.sqlite3')
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        with transaction.atomic():
            candidates = cur.execute('SELECT id, name, party, display_order, created_at FROM poll_candidate').fetchall()
            for row in candidates:
                pk = row['id']
                name = row['name']
                party = row['party']
                display_order = row['display_order']
                created_at = row['created_at']
                if isinstance(created_at, str):
                    try:
                        created_at_dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    except Exception:
                        created_at_dt = datetime.utcnow()
                else:
                    created_at_dt = datetime.utcnow()
                Candidate.objects.update_or_create(
                    id=pk,
                    defaults={
                        'name': name,
                        'party': party,
                        'display_order': display_order,
                        'created_at': created_at_dt,
                    },
                )
            votecounts = cur.execute('SELECT candidate_id, total_votes, actual_votes, boosted_votes, updated_at FROM poll_votecount').fetchall()
            for row in votecounts:
                candidate_id = row['candidate_id']
                total_votes = row['total_votes']
                actual_votes = row['actual_votes']
                boosted_votes = row['boosted_votes']
                updated_at = row['updated_at']
                if isinstance(updated_at, str):
                    try:
                        updated_at_dt = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
                    except Exception:
                        updated_at_dt = datetime.utcnow()
                else:
                    updated_at_dt = datetime.utcnow()
                VoteCount.objects.update_or_create(
                    candidate_id=candidate_id,
                    defaults={
                        'total_votes': total_votes,
                        'actual_votes': actual_votes,
                        'boosted_votes': boosted_votes,
                        'updated_at': updated_at_dt,
                    },
                )
            votes = cur.execute('SELECT id, ip_address, candidate_id, timestamp FROM poll_vote').fetchall()
            for row in votes:
                pk = row['id']
                ip_address = row['ip_address']
                candidate_id = row['candidate_id']
                timestamp = row['timestamp']
                if isinstance(timestamp, str):
                    try:
                        timestamp_dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    except Exception:
                        timestamp_dt = datetime.utcnow()
                else:
                    timestamp_dt = datetime.utcnow()
                Vote.objects.update_or_create(
                    id=pk,
                    defaults={
                        'ip_address': ip_address,
                        'candidate_id': candidate_id,
                        'timestamp': timestamp_dt,
                    },
                )
        conn.close()
        self.stdout.write(self.style.SUCCESS('Transfer completed'))
