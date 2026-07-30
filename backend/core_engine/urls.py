from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileView,
    signup_view,
    login_view,
    MatchCreatorsForCampaignView,
    MatchCreatorsView,
    MatchCampaignsForCreatorView,
    CampaignViewSet, 
    CampaignApplicationViewSet,
    UserSearchAndSortView,
)

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'applications', CampaignApplicationViewSet, basename='application')

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/signup/', signup_view, name='api_signup'),
    path('auth/login/', login_view, name='api_login'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),

    path('users/search/', UserSearchAndSortView.as_view(), name='user_search'),
    path('match-creators/', MatchCreatorsView.as_view(), name='match_creators'),
    path('campaigns/<int:campaign_id>/match/', MatchCreatorsForCampaignView.as_view(), name='campaign_match_creators'),
    path('creator/match-campaigns/<int:creator_id>/', MatchCampaignsForCreatorView.as_view(), name='creator_match_campaigns'),

    path('', include(router.urls)),
]