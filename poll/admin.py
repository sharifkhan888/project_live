from django.contrib import admin
from .models import Candidate, Vote, VoteCount, SiteSettings

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['name', 'party', 'display_order', 'created_at']
    list_filter = ['party', 'created_at']
    search_fields = ['name', 'party']
    ordering = ['display_order', 'name']

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['ip_address', 'candidate', 'timestamp']
    list_filter = ['candidate', 'timestamp']
    search_fields = ['ip_address', 'candidate__name']
    readonly_fields = ['ip_address', 'candidate', 'timestamp']

@admin.register(VoteCount)
class VoteCountAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'total_votes', 'actual_votes', 'boosted_votes', 'updated_at']
    readonly_fields = ['candidate', 'total_votes', 'actual_votes', 'boosted_votes', 'updated_at']

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['site_name', 'title', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('site_name', 'title', 'description', 'image_url')
        }),
    )
