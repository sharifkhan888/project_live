from django.db import models
from django.utils import timezone

class Candidate(models.Model):
    name = models.CharField(max_length=100)
    party = models.CharField(max_length=100)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['display_order', 'name']
        unique_together = [('name', 'party')]
    
    def __str__(self):
        return f"{self.name} ({self.party})"

class Vote(models.Model):
    ip_address = models.GenericIPAddressField()
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    vote_index = models.IntegerField(default=1)
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = [('ip_address', 'vote_index')]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Vote #{self.vote_index} from {self.ip_address} for {self.candidate.name}"

class VoteCount(models.Model):
    candidate = models.OneToOneField(Candidate, on_delete=models.CASCADE, primary_key=True)
    total_votes = models.IntegerField(default=0)
    actual_votes = models.IntegerField(default=0)
    boosted_votes = models.IntegerField(default=0)
    updated_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.candidate.name}: {self.total_votes} votes"

class SiteSettings(models.Model):
    title = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField(blank=True, default='')
    image_url = models.URLField(blank=True, default='')
    site_name = models.CharField(max_length=120, blank=True, default='')
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.site_name or 'Site Settings'

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
