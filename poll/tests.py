from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from .models import GlobalTimer

class GlobalTimerApiTests(TestCase):
    def test_end_time_and_remaining_for_recent_start(self):
        timer = GlobalTimer.get_solo()
        timer.start_time = timezone.now() - timedelta(hours=1)
        timer.end_time = timer.start_time + timedelta(hours=48)
        timer.save()

        url = reverse('get_cycle_end_time')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get('success'))
        self.assertIn('end_time', data)
        self.assertIn('remaining_seconds', data)
        remaining = int(data['remaining_seconds'])
        self.assertGreater(remaining, 46 * 3600)
        self.assertLessEqual(remaining, 48 * 3600)

    def test_cycle_rollover_for_past_start(self):
        timer = GlobalTimer.get_solo()
        timer.start_time = timezone.now() - timedelta(hours=49)
        timer.end_time = timer.start_time + timedelta(hours=48)
        timer.save()

        url = reverse('get_cycle_end_time')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get('success'))
        remaining = int(data['remaining_seconds'])
        self.assertGreater(remaining, 46 * 3600)
        self.assertLessEqual(remaining, 48 * 3600)

# Create your tests here.
