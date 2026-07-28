from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    UserProfileView,
    signup_view,
    login_view,
    MatchCreatorsForCampaignView,
    MatchCreatorsView,
    CampaignCreateView,
    MatchCampaignsForCreatorView,
    CampaignDetailView,
)

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/signup/', signup_view, name='api_signup'),
    path('auth/login/', login_view, name='api_login'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),

    path('match-creators/', MatchCreatorsView.as_view(), name='match_creators'),
    path('campaigns/', CampaignCreateView.as_view(), name='campaign_create'),
    path('campaigns/<int:campaign_id>/match/', MatchCreatorsForCampaignView.as_view(), name='campaign_match_creators'),
    path('creator/match-campaigns/<int:creator_id>/', MatchCampaignsForCreatorView.as_view(), name='creator_match_campaigns'),
    path('campaigns/<int:pk>/', CampaignDetailView.as_view(), name='campaign-detail'),
]