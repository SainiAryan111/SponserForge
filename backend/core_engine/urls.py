from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    CreatorProfileView,
    signup_view,
    login_view,
    MatchCreatorsForCampaignView,
    MatchCreatorsView,
    CampaignCreateView,
    MatchCampaignsForCreatorView
)

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/signup/', signup_view, name='api_signup'),
    path('auth/login/', login_view, name='api_login'),

    path('creators/profile/', CreatorProfileView.as_view(), name='creator_profile'),

    path('match-creators/', MatchCreatorsView.as_view(), name='match_creators'),
    path('campaigns/', CampaignCreateView.as_view(), name='campaign_create'),
    path('campaigns/<int:campaign_id>/match/', MatchCreatorsForCampaignView.as_view(), name='campaign_match_creators'),
    path('creators/<int:creator_id>/match-campaigns/', MatchCampaignsForCreatorView.as_view(), name='creator_match_campaigns'),
]
