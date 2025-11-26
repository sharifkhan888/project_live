from django.urls import path
from . import views

urlpatterns = [
    path('api/vote/', views.cast_vote, name='cast_vote'),
    path('api/results/', views.get_results, name='get_results'),
    path('api/candidates/', views.get_candidates, name='get_candidates'),
    path('api/end_time/', views.get_cycle_end_time, name='get_cycle_end_time'),
]
