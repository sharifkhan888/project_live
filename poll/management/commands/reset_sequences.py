from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    def handle(self, *args, **options):
        cur = connection.cursor()
        cur.execute("SELECT setval(pg_get_serial_sequence('poll_candidate','id'), COALESCE(MAX(id), 1), true) FROM poll_candidate")
        cur.execute("SELECT setval(pg_get_serial_sequence('poll_vote','id'), COALESCE(MAX(id), 1), true) FROM poll_vote")
        self.stdout.write(self.style.SUCCESS('Sequences reset'))
