from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q, Avg
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from rest_framework_simplejwt.tokens import RefreshToken
from sentence_transformers import SentenceTransformer
from pgvector.django import CosineDistance

from .models import BrandProfile, CreatorProfile, Campaign, CampaignApplication, PointsTransaction
from .serializers import CampaignSerializer, CreatorMatchSerializer, CreatorProfileSerializer, BrandProfileSerializer, CampaignApplicationSerializer
from .mailer import (
    send_welcome_email,
    send_brand_campaign_created_notification,
    send_brand_application_notification,
    send_brand_offer_response_notification,
    send_brand_work_submitted_notification,
    send_brand_completion_notification,
    send_brand_expiration_notification,
    send_creator_direct_offer_notification,
    send_creator_application_confirmation,
    send_creator_application_decision,
    send_creator_work_submitted_confirmation,
    send_creator_reward_and_review_notification,
    send_creator_work_rejected_notification,
    send_creator_expiration_notification,
)

from rest_framework.decorators import action
from django.db import transaction


User = get_user_model()

# Global SentenceTransformer model instance (Loaded once on app startup)
embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')


# ==========================================
# 1. SIGNUP VIEW
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # Expects 'brand' or 'creator'

    if not username or not password or not role:
        return Response({'error': 'Missing required credentials or portal role.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if role not in ['brand', 'creator']:
        return Response({'error': 'Invalid account role profile architecture type.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'This identity username has already been allocated.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. Create Base User
        user = User.objects.create_user(
            username=username, 
            email=email, 
            password=password,
            role=role
        )
        
        # 2. Populate Profile Data based on Role
        if role == 'brand':
            BrandProfile.objects.create(
                user=user,
                company_name=data.get('company_name', ''),
                industry=data.get('industry', ''),
                website=data.get('website'),
                company_size=data.get('company_size'),
                target_audience=data.get('target_audience'),
                bio=data.get('bio', ''),
                location=data.get('location'),
                logo_url=data.get('logo_url'),
                social_links=data.get('social_links', {})
            )
        elif role == 'creator':
            bio = data.get('bio', '')
            raw_niche = data.get('niche', 'tech')
            niche = ",".join(raw_niche) if isinstance(raw_niche, list) else str(raw_niche)
            
            raw_platform = data.get('primary_platform', 'youtube')
            primary_platform = ",".join(raw_platform) if isinstance(raw_platform, list) else str(raw_platform)

            # Generate initial vector embedding
            text_to_embed = f"{niche}. {bio}".strip()
            vector_embedding = embedding_model.encode(text_to_embed).tolist() if text_to_embed else None

            # Safe numeric conversion
            try:
                sub_count = int(data.get('subscriber_count') or 0)
            except (ValueError, TypeError):
                sub_count = 0

            try:
                eng_rate = float(data.get('engagement_rate') or 2.50)
            except (ValueError, TypeError):
                eng_rate = 2.50

            CreatorProfile.objects.create(
                user=user,
                name=data.get('name', ''),
                bio=bio,
                niche=niche,
                primary_platform=primary_platform,
                platform_link=data.get('platform_link'),
                subscriber_count=sub_count,
                engagement_rate=eng_rate,
                location=data.get('location'),
                avatar_url=data.get('avatar_url'),
                social_links=data.get('social_links', {}),
                embedding=vector_embedding
            )

        # 3. Generate JWT access keys
        refresh = RefreshToken.for_user(user)

        # Dispatch Nodemailer welcome email
        try:
            send_welcome_email(user.email, user.username, role)
        except Exception:
            pass
        
        return Response({
            'message': 'Account created successfully.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'role': user.role
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': f'Profile deployment failure: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==========================================
# 2. LOGIN VIEW
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    requested_role = request.data.get('role')  # 'brand' or 'creator'

    user = authenticate(username=username, password=password)
    
    if user is not None:
        if requested_role and user.role != requested_role:
            return Response({
                "error": f"Access Denied. This account is registered as a {user.role.capitalize()}, not a {requested_role.capitalize()}."
            }, status=status.HTTP_403_FORBIDDEN)
            
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Authentication successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "role": user.role
        }, status=status.HTTP_200_OK)
        
    return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)


import requests

def verify_google_oauth_token(access_token=None, id_token=None):
    """
    Verifies Google OAuth Access Token or ID Token with Google's official OAuth2 servers.
    Returns verified user info dict (email, name, picture, verified_email) if valid.
    """
    if access_token:
        # Try Endpoint 1: userinfo with Bearer header
        try:
            resp = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=8
            )
            print("Google OAuth UserInfo (Bearer) status:", resp.status_code)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("email"):
                    return {
                        "email": data.get("email"),
                        "name": data.get("name") or data.get("given_name"),
                        "picture": data.get("picture"),
                        "email_verified": data.get("email_verified", True)
                    }
        except Exception as e:
            print("Google Userinfo Bearer error:", e)

        # Try Endpoint 2: userinfo with query param
        try:
            resp = requests.get(
                f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}",
                timeout=8
            )
            print("Google OAuth UserInfo (Query) status:", resp.status_code)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("email"):
                    return {
                        "email": data.get("email"),
                        "name": data.get("name") or data.get("given_name"),
                        "picture": data.get("picture"),
                        "email_verified": data.get("verified_email", True)
                    }
        except Exception as e:
            print("Google Userinfo Query error:", e)

    if id_token:
        try:
            resp = requests.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}",
                timeout=8
            )
            print("Google OAuth TokenInfo status:", resp.status_code)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("email"):
                    return {
                        "email": data.get("email"),
                        "name": data.get("name") or data.get("given_name"),
                        "picture": data.get("picture"),
                        "email_verified": data.get("email_verified") == "true" or data.get("email_verified") is True
                    }
        except Exception as e:
            print("Google ID Token verification error:", e)

    return None


# ==========================================
# 3. GOOGLE AUTHENTICATION VIEW
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    import jwt
    data = request.data
    credential = data.get('credential')
    access_token = data.get('access_token')
    role = data.get('role', 'creator')

    if role not in ['brand', 'creator']:
        role = 'creator'

    email = None
    name = None
    picture = None

    # 1. Server-side verification with Google OAuth2 APIs
    google_user = verify_google_oauth_token(access_token=access_token, id_token=credential)
    if google_user:
        email = google_user.get('email')
        name = google_user.get('name')
        picture = google_user.get('picture')

    # 2. Fallback to token payload decoding
    if not email and credential:
        try:
            decoded = jwt.decode(credential, options={"verify_signature": False})
            email = decoded.get('email')
            name = decoded.get('name') or decoded.get('given_name')
            picture = decoded.get('picture')
        except Exception as e:
            print("JWT decode warning:", e)

    if not email:
        email = data.get('email')
    if not name:
        name = data.get('name') or (email.split('@')[0] if email else 'User')

    if not email:
        return Response({'error': 'Google OAuth verification failed: Valid Google credentials required.'}, status=status.HTTP_400_BAD_REQUEST)

    custom_username = data.get('username')
    if custom_username and str(custom_username).strip():
        req_uname = str(custom_username).strip()
        existing = User.objects.filter(username__iexact=req_uname).exclude(email__iexact=email).first()
        if existing:
            return Response({'error': f'The username handle @{req_uname} is already taken by another account.'}, status=status.HTTP_400_BAD_REQUEST)
        base_username = req_uname

    base_username = email.split('@')[0].replace('.', '_').replace('+', '_') if not custom_username else str(custom_username).strip()
    user = User.objects.filter(email__iexact=email).first()

    provided_password = data.get('password')

    created = False
    if not user:
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        import secrets
        random_pass = secrets.token_urlsafe(16)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=provided_password if provided_password else random_pass,
            role=role
        )
        created = True

        if role == 'brand':
            BrandProfile.objects.create(
                user=user,
                company_name=data.get('company_name') or name or username,
                industry=data.get('industry') or 'SaaS & AI Software',
                website=data.get('website'),
                company_size=data.get('company_size'),
                target_audience=data.get('target_audience'),
                bio=data.get('bio') or 'Brand profile authenticated via Google.',
                location=data.get('location'),
                logo_url=data.get('logo_url') or picture
            )
        elif role == 'creator':
            raw_niche = data.get('niche', 'tech')
            niche_str = ",".join(raw_niche) if isinstance(raw_niche, list) else str(raw_niche)
            raw_platform = data.get('primary_platform', 'youtube')
            platform_str = ",".join(raw_platform) if isinstance(raw_platform, list) else str(raw_platform)

            try:
                sub_count = int(data.get('subscriber_count') or 1000)
            except (ValueError, TypeError):
                sub_count = 1000

            try:
                eng_rate = float(data.get('engagement_rate') or 2.50)
            except (ValueError, TypeError):
                eng_rate = 2.50

            CreatorProfile.objects.create(
                user=user,
                name=data.get('name') or name or username,
                bio=data.get('bio') or 'Creator profile authenticated via Google.',
                niche=niche_str,
                primary_platform=platform_str,
                platform_link=data.get('platform_link'),
                subscriber_count=sub_count,
                engagement_rate=eng_rate,
                location=data.get('location'),
                avatar_url=data.get('avatar_url') or picture
            )

        # Trigger welcome email via Nodemailer
        try:
            send_welcome_email(user.email, user.username, role)
        except Exception:
            pass
    else:
        # If user exists and custom username is passed, update username if valid
        if custom_username and str(custom_username).strip() and user.username != str(custom_username).strip():
            user.username = str(custom_username).strip()
            user.save()

    refresh = RefreshToken.for_user(user)

    user_payload = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
    }

    if user.role == 'brand' and hasattr(user, 'brand_profile'):
        user_payload.update(BrandProfileSerializer(user.brand_profile).data)
    elif user.role == 'creator' and hasattr(user, 'creator_profile'):
        user_payload.update(CreatorProfileSerializer(user.creator_profile).data)

    return Response({
        'message': 'Google authentication successful.',
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': user_payload,
        'username': user.username,
        'role': user.role,
        'created': created
    }, status=status.HTTP_200_OK)


# ==========================================
# 3. MATCH CREATORS (DIRECT QUERY SEARCH)
# ==========================================
class MatchCreatorsView(APIView):
    def post(self, request):
        query = request.data.get('query', '')
        platform = request.data.get('platform', None)
        niche = request.data.get('niche', None)
        min_subs = request.data.get('min_subscribers', 0)
        max_subs = request.data.get('max_subscribers', None)
        min_engagement = request.data.get('min_engagement', 0.0)

        if not query:
            return Response({"error": "A search query string is required."}, status=status.HTTP_400_BAD_REQUEST)

        filters = Q(subscriber_count__gte=min_subs) & Q(engagement_rate__gte=min_engagement)

        if platform and platform.strip():
            filters &= Q(primary_platform__iexact=platform.strip())

        if niche and niche.strip():
            filters &= Q(niche__icontains=niche.strip())

        if max_subs is not None:
            filters &= Q(subscriber_count__lte=max_subs)

        query_vector = embedding_model.encode(query).tolist()

        results = (
            CreatorProfile.objects
            .filter(filters)
            .annotate(distance=CosineDistance("embedding", query_vector))
            .order_by("distance")[:10]
        )

        for profile in results:
            profile.similarity_score = round(1 - profile.distance, 4)

        serializer = CreatorMatchSerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==========================================
# 4. CAMPAIGN CREATION & LISTING (UPDATED)
# ==========================================
class CampaignCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # If the requester is a Brand, return only their campaigns
        if getattr(user, 'role', '') == 'brand':
            return Campaign.objects.filter(brand_user=user).order_by('-created_at')
        
        # If the requester is a Creator, return all campaigns
        return Campaign.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title', '')
        description = serializer.validated_data.get('description', '')
        niche = serializer.validated_data.get('target_niche', '')
        
        text_to_embed = f"{title}. {description}. Niche: {niche}"
        vector = embedding_model.encode(text_to_embed).tolist()

        campaign = serializer.save(
            brand_user=self.request.user,
            embedding=vector
        )

        try:
            brand_user = self.request.user
            send_brand_campaign_created_notification(
                brand_email=brand_user.email,
                brand_username=brand_user.username,
                campaign_title=campaign.title,
                points_reward=campaign.points_reward,
                target_niche=campaign.target_niche,
                total_creators_needed=campaign.creators_needed
            )
        except Exception:
            pass


# ==========================================
# 5. CAMPAIGN DETAIL, UPDATE & DELETE
# ==========================================
class CampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if instance.brand_user != request.user:
            return Response({"detail": "Not authorized to edit this campaign."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        updated_campaign = serializer.save()

        title = request.data.get('title', instance.title)
        desc = request.data.get('description', instance.description)
        niche = request.data.get('target_niche', instance.target_niche)
        
        text_to_embed = f"{title}. {desc}. Niche: {niche}"
        updated_campaign.embedding = embedding_model.encode(text_to_embed).tolist()
        updated_campaign.save()

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.brand_user != request.user:
            return Response({"detail": "Not authorized to delete this campaign."}, status=status.HTTP_403_FORBIDDEN)
        
        self.perform_destroy(instance)
        return Response({"detail": "Campaign deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# ==========================================
# 6. MATCH CREATORS FOR A CAMPAIGN
# ==========================================
class MatchCreatorsForCampaignView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, campaign_id):
        campaign = get_object_or_404(Campaign, id=campaign_id)

        # Auto-generate embedding if missing on campaign
        if not campaign.embedding:
            text_to_embed = f"{campaign.title}. {campaign.description}. Niche: {campaign.target_niche}"
            campaign.embedding = embedding_model.encode(text_to_embed).tolist()
            campaign.save(update_fields=['embedding'])

        filters = Q(subscriber_count__gte=campaign.min_subscribers_required)
        
        target_platform = (campaign.target_platform or '').strip().lower()
        if target_platform and target_platform not in ['all', 'any', 'multi']:
            platforms = [p.strip() for p in target_platform.replace('/', ',').split(',') if p.strip()]
            platform_q = Q()
            for p in platforms:
                platform_q |= Q(primary_platform__icontains=p)
            filters &= platform_q

        # 1. Primary Vector Search (creators with embeddings)
        matched_creators = list(
            CreatorProfile.objects
            .filter(filters & Q(embedding__isnull=False))
            .annotate(distance=CosineDistance("embedding", campaign.embedding))
            .order_by("distance")[:10]
        )

        # 2. Fallback Search if vector filter excludes creators
        if not matched_creators:
            matched_creators = list(
                CreatorProfile.objects
                .filter(filters)
                .order_by("-subscriber_count")[:10]
            )
            if not matched_creators:
                matched_creators = list(CreatorProfile.objects.all().order_by("-subscriber_count")[:10])

        for profile in matched_creators:
            # 1. Semantic Vector Similarity
            if hasattr(profile, 'distance') and profile.distance is not None:
                try:
                    d = float(profile.distance)
                    cos_sim = max(0.0, min(1.0, 1.0 - d))
                    vec_score = max(0.50, min(0.98, 0.50 + (cos_sim * 0.60)))
                except (ValueError, TypeError):
                    vec_score = 0.80
            else:
                vec_score = 0.80

            # 2. Niche Alignment
            prof_niche = (profile.niche or '').strip().lower()
            camp_niche = (campaign.target_niche or '').strip().lower()
            if prof_niche and camp_niche:
                if prof_niche == camp_niche:
                    niche_score = 0.98
                elif prof_niche in camp_niche or camp_niche in prof_niche:
                    niche_score = 0.92
                else:
                    c_words = set(prof_niche.replace('&', ' ').replace('/', ' ').split())
                    g_words = set(camp_niche.replace('&', ' ').replace('/', ' ').split())
                    if c_words.intersection(g_words):
                        niche_score = 0.86
                    else:
                        niche_score = 0.60
            else:
                niche_score = 0.75

            # 3. Platform Alignment
            prof_platform = (profile.primary_platform or '').strip().lower()
            camp_platform = (campaign.target_platform or '').strip().lower()
            if prof_platform and camp_platform:
                if prof_platform == camp_platform or camp_platform in ['all', 'any', 'multi']:
                    platform_score = 0.98
                elif prof_platform in camp_platform or camp_platform in prof_platform:
                    platform_score = 0.90
                else:
                    platform_score = 0.65
            else:
                platform_score = 0.80

            # 4. Subscriber Qualification
            if profile.subscriber_count >= campaign.min_subscribers_required:
                sub_score = 0.98
            else:
                sub_score = 0.60

            # Composite AI Match Score (Rating is NOT included in match %): 40% Vector, 35% Niche, 15% Platform, 10% Subscriber
            composite = (vec_score * 0.40) + (niche_score * 0.35) + (platform_score * 0.15) + (sub_score * 0.10)
            
            profile.similarity_score = round(min(0.98, max(0.55, composite)), 4)

        # Sort matched creators by final rating-weighted match score descending
        matched_creators.sort(key=lambda x: getattr(x, 'similarity_score', 0), reverse=True)

        serializer = CreatorMatchSerializer(matched_creators, many=True)
        return Response({
            "campaign": campaign.title,
            "matches": serializer.data
        }, status=status.HTTP_200_OK)


# ==========================================
# 7. MATCH CAMPAIGNS FOR A CREATOR
# ==========================================
class MatchCampaignsForCreatorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        creator = get_object_or_404(CreatorProfile, id=creator_id)

        # 1. Auto-generate creator vector embedding if missing
        if not creator.embedding:
            niche_text = creator.niche or "general content"
            bio_text = creator.bio or f"Content creator on {creator.primary_platform or 'YouTube'}"
            text_to_embed = f"Niche: {niche_text}. Platform: {creator.primary_platform}. {bio_text}"
            if hasattr(embedding_model, 'encode'):
                try:
                    creator.embedding = embedding_model.encode(text_to_embed).tolist()
                    creator.save(update_fields=['embedding'])
                except Exception as e:
                    print(f"Error generating creator embedding: {e}")

        # 2. Build initial requirement filters (active campaigns only)
        filters = Q(status='active') & Q(min_subscribers_required__lte=creator.subscriber_count)
        
        creator_platform = (creator.primary_platform or '').strip().lower()
        if creator_platform:
            platforms = [p.strip() for p in creator_platform.replace('/', ',').split(',') if p.strip()]
            platform_q = Q(target_platform__iexact='all') | Q(target_platform__iexact='any') | Q(target_platform__isnull=True) | Q(target_platform='')
            for p in platforms:
                platform_q |= Q(target_platform__icontains=p)
            filters &= platform_q

        matched_campaigns = []

        # 3. Vector search if creator has an embedding
        if creator.embedding:
            matched_campaigns = list(
                Campaign.objects
                .filter(filters & Q(embedding__isnull=False))
                .annotate(distance=CosineDistance("embedding", creator.embedding))
                .order_by("distance")[:10]
            )

        # 4. FALLBACK: If strict filters exclude everything, widen search to active campaigns
        if not matched_campaigns:
            if creator.embedding:
                matched_campaigns = list(
                    Campaign.objects
                    .filter(status='active', embedding__isnull=False)
                    .annotate(distance=CosineDistance("embedding", creator.embedding))
                    .order_by("distance")[:10]
                )
            if not matched_campaigns:
                matched_campaigns = list(Campaign.objects.filter(status='active').order_by('-created_at')[:10])

        # 5. Compute accurate, dynamic multi-factor AI Match Scores
        results = []
        creator_niche = (creator.niche or '').strip().lower()
        creator_platform = (creator.primary_platform or '').strip().lower()

        for campaign in matched_campaigns:
            campaign_data = CampaignSerializer(campaign).data

            # 1. Semantic Vector Similarity
            if hasattr(campaign, 'distance') and campaign.distance is not None:
                try:
                    d = float(campaign.distance)
                    cos_sim = max(0.0, min(1.0, 1.0 - d))
                    vec_score = max(0.50, min(0.98, 0.50 + (cos_sim * 0.60)))
                except (ValueError, TypeError):
                    vec_score = 0.80
            else:
                vec_score = 0.80

            # 2. Categorical Niche Alignment
            camp_niche = (campaign.target_niche or '').strip().lower()
            if creator_niche and camp_niche:
                if creator_niche == camp_niche:
                    niche_score = 0.98
                elif creator_niche in camp_niche or camp_niche in creator_niche:
                    niche_score = 0.92
                else:
                    c_words = set(creator_niche.replace('&', ' ').replace('/', ' ').split())
                    g_words = set(camp_niche.replace('&', ' ').replace('/', ' ').split())
                    overlap = c_words.intersection(g_words)
                    if overlap:
                        niche_score = 0.86
                    else:
                        niche_score = 0.60
            else:
                niche_score = 0.75

            # 3. Target Platform Alignment
            camp_platform = (campaign.target_platform or '').strip().lower()
            if creator_platform and camp_platform:
                if creator_platform == camp_platform or camp_platform in ['all', 'any', 'multi']:
                    platform_score = 0.98
                elif creator_platform in camp_platform or camp_platform in creator_platform:
                    platform_score = 0.90
                else:
                    platform_score = 0.65
            else:
                platform_score = 0.80

            # 4. Subscriber Requirement Qualification
            if creator.subscriber_count >= campaign.min_subscribers_required:
                sub_score = 0.98
            else:
                sub_score = 0.60

            # Composite AI Match Score (Rating is NOT included in match %): 40% Vector, 35% Niche, 15% Platform, 10% Subscriber
            composite = (vec_score * 0.40) + (niche_score * 0.35) + (platform_score * 0.15) + (sub_score * 0.10)
            
            final_score = round(min(0.98, max(0.55, composite)), 4)
            campaign_data['similarity_score'] = final_score
            campaign_data['match_percentage'] = int(round(final_score * 100))

            results.append(campaign_data)

        # Sort matches by similarity_score descending
        results.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)

        return Response({
            "creator": creator.user.username,
            "matched_campaigns": results
        }, status=status.HTTP_200_OK)


# ==========================================
# 8. USER PROFILE MANAGEMENT
# ==========================================
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        target_username = request.query_params.get('username')
        if target_username:
            user = get_object_or_404(User, username__iexact=target_username.strip())
        else:
            user = request.user

        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        }

        # Dynamically attach role-specific profile data
        if user.role == 'creator':
            profile = get_object_or_404(CreatorProfile, user=user)
            profile_data = CreatorProfileSerializer(profile).data
            data.update(profile_data)
        elif user.role == 'brand':
            profile = get_object_or_404(BrandProfile, user=user)
            profile_data = BrandProfileSerializer(profile).data
            data.update(profile_data)

        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user

        # Update base User credentials if provided
        username = request.data.get('username')
        email = request.data.get('email')
        if username and username != user.username:
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({"error": "This username is already taken."}, status=status.HTTP_400_BAD_REQUEST)
            user.username = username
        if email:
            user.email = email
        user.save()

        if user.role == 'creator':
            profile = get_object_or_404(CreatorProfile, user=user)
            serializer = CreatorProfileSerializer(profile, data=request.data, partial=True)

            if serializer.is_valid():
                bio = serializer.validated_data.get('bio', profile.bio or '')
                niche = serializer.validated_data.get('niche', profile.niche or '')

                # Re-generate vector embedding if bio/niche updated
                text_to_embed = f"{niche}. {bio}"
                if hasattr(embedding_model, 'encode'):
                    vector_embedding = embedding_model.encode(text_to_embed).tolist()
                    updated_profile = serializer.save(embedding=vector_embedding)
                else:
                    updated_profile = serializer.save()

                response_data = serializer.data
                response_data.update({"username": user.username, "email": user.email, "role": user.role})
                return Response(response_data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif user.role == 'brand':
            profile = get_object_or_404(BrandProfile, user=user)
            serializer = BrandProfileSerializer(profile, data=request.data, partial=True)

            if serializer.is_valid():
                updated_profile = serializer.save()
                
                # Manual points_balance update for top-ups
                if 'points_balance' in request.data:
                    try:
                        new_balance = int(request.data['points_balance'])
                        if new_balance > profile.points_balance:
                            PointsTransaction.objects.create(
                                brand=updated_profile,
                                amount=new_balance - profile.points_balance,
                                transaction_type='top_up'
                            )
                        updated_profile.points_balance = new_balance
                        updated_profile.save()
                    except (ValueError, TypeError):
                        pass

                response_data = serializer.data
                response_data['points_balance'] = updated_profile.points_balance
                response_data.update({"username": user.username, "email": user.email, "role": user.role})
                return Response(response_data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Unsupported user role"}, status=status.HTTP_400_BAD_REQUEST)
    

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BrandProfileSerializer

    def get_object(self):
        # Fetch or auto-create the BrandProfile for the logged-in user
        profile, _ = BrandProfile.objects.get_or_create(user=self.request.user)
        return profile


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all().order_by('-created_at')
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'brand':
            qs = Campaign.objects.filter(brand_user=user)
        else:
            qs = Campaign.objects.all()
        
        # Check and refresh status lifecycle for campaigns
        for campaign in qs:
            campaign.check_and_update_status()

        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title', '')
        description = serializer.validated_data.get('description', '')
        niche = serializer.validated_data.get('target_niche', '')
        start_dt = serializer.validated_data.get('start_datetime')
        start_instantly = self.request.data.get('start_instantly', False)

        now = timezone.now()
        initial_status = 'active'

        if start_instantly or not start_dt:
            start_dt = now
            initial_status = 'active'
        elif start_dt > now:
            initial_status = 'scheduled'
        else:
            initial_status = 'active'

        text_to_embed = f"{title}. {description}. Niche: {niche}"
        vector = embedding_model.encode(text_to_embed).tolist()

        campaign = serializer.save(
            brand_user=self.request.user,
            embedding=vector,
            start_datetime=start_dt,
            status=initial_status
        )

        try:
            brand_user = self.request.user
            send_brand_campaign_created_notification(
                brand_email=brand_user.email,
                brand_username=brand_user.username,
                campaign_title=campaign.title,
                points_reward=campaign.points_reward,
                target_niche=campaign.target_niche,
                total_creators_needed=campaign.creators_needed
            )
        except Exception:
            pass

    def perform_update(self, serializer):
        title = serializer.validated_data.get('title', serializer.instance.title)
        description = serializer.validated_data.get('description', serializer.instance.description)
        niche = serializer.validated_data.get('target_niche', serializer.instance.target_niche)
        
        text_to_embed = f"{title}. {description}. Niche: {niche}"
        vector = embedding_model.encode(text_to_embed).tolist()

        serializer.save(embedding=vector)

    @action(detail=True, methods=['post'], url_path='start-instantly')
    def start_instantly(self, request, pk=None):
        campaign = self.get_object()
        if campaign.brand_user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)
        
        campaign.start_datetime = timezone.now()
        campaign.status = 'active'
        campaign.save()
        return Response({
            "message": f"Campaign '{campaign.title}' has been launched instantly!",
            "campaign": CampaignSerializer(campaign).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='end-instantly')
    def end_instantly(self, request, pk=None):
        campaign = self.get_object()
        if campaign.brand_user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)
        
        brand_profile = getattr(request.user, 'brand_profile', None)

        # 1. Fetch all creators currently working on this campaign ('accepted' or 'submitted')
        in_progress_apps = list(campaign.applications.filter(status__in=['accepted', 'submitted']))
        
        total_payout_points = len(in_progress_apps) * campaign.points_reward
        creator_names = [f"@{app.creator.user.username}" for app in in_progress_apps]
        abc_creators_str = ", ".join(creator_names) if creator_names else ""

        if in_progress_apps:
            # Check brand points balance
            if brand_profile and brand_profile.points_balance < total_payout_points:
                return Response({
                    "error": f"Insufficient points balance ({brand_profile.points_balance} pts available). Ending this campaign requires {total_payout_points} pts to pay active creator(s) {abc_creators_str}."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Auto-payout points to each working creator and complete their applications
            with transaction.atomic():
                if brand_profile:
                    brand_profile.points_balance -= total_payout_points
                    brand_profile.save()

                for app in in_progress_apps:
                    creator = app.creator
                    creator.points_balance += campaign.points_reward
                    creator.save()

                    app.status = 'expired'
                    app.save(update_fields=['status'])

                    PointsTransaction.objects.create(
                        brand=brand_profile,
                        creator=creator,
                        campaign=campaign,
                        amount=campaign.points_reward,
                        transaction_type='campaign_payout'
                    )

            campaign.status = 'cancelled'
            msg = f"Campaign '{campaign.title}' ended before deadline. Creator(s) {abc_creators_str} received {total_payout_points} PTS payout and deal status marked as EXPIRED."
        else:
            # Check if any creators were completed previously
            completed_apps_count = campaign.applications.filter(status='completed').count()
            if completed_apps_count > 0:
                campaign.status = 'completed'
                msg = f"Campaign '{campaign.title}' has been ended."
            else:
                campaign.status = 'cancelled'
                msg = f"Campaign '{campaign.title}' has been cancelled since no creators were accepted."

        campaign.save()
        # Reject remaining pending/offered applications
        campaign.applications.filter(status__in=['pending', 'offered']).update(status='rejected')

        return Response({
            "message": msg,
            "campaign": CampaignSerializer(campaign).data,
            "paid_creators": abc_creators_str,
            "paid_points": total_payout_points
        }, status=status.HTTP_200_OK)


class CampaignApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'brand':
            qs = CampaignApplication.objects.filter(campaign__brand_user=user)
        elif getattr(user, 'role', '') == 'creator':
            qs = CampaignApplication.objects.filter(creator__user=user)
        else:
            return CampaignApplication.objects.none()

        for app in qs:
            app.check_and_update_deadline_status()
            app.check_and_auto_payout_review_timeout()

        return qs.order_by('-applied_at')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.check_and_update_deadline_status()
        instance.check_and_auto_payout_review_timeout()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'creator_profile'):
            raise PermissionDenied("Only creators can apply to campaigns.")
        creator_profile = getattr(self.request.user, 'creator_profile')
        campaign = serializer.validated_data.get('campaign')

        # Capacity Check: Check if campaign slots are already full or campaign completed
        if campaign.status == 'completed' or campaign.check_and_update_status():
            raise PermissionDenied("This campaign has already filled all available creator positions and is completed.")

        app_instance = serializer.save(creator=creator_profile)

        # Dispatch Nodemailer notifications
        try:
            creator_username = creator_profile.user.username
            creator_email = creator_profile.user.email
            brand_email = campaign.brand_user.email
            brand_name = getattr(getattr(campaign.brand_user, 'brand_profile', None), 'company_name', None) or campaign.brand_user.username

            send_creator_application_confirmation(creator_email, creator_username, campaign.title, brand_name)
            send_brand_application_notification(brand_email, brand_name, creator_username, campaign.title, app_instance.pitch)
        except Exception:
            pass

    @action(detail=False, methods=['post'], url_path='offer-campaign')
    def offer_campaign(self, request):
        if getattr(request.user, 'role', '') != 'brand':
            return Response({"error": "Only brand entities can send campaign offers."}, status=status.HTTP_403_FORBIDDEN)
        
        campaign_id = request.data.get('campaign_id')
        creator_id = request.data.get('creator_id')
        work_description = request.data.get('work_description', '')
        deadline_raw = request.data.get('submission_deadline')
        deadline_hours = request.data.get('deadline_hours')

        if not campaign_id or not creator_id:
            return Response({"error": "campaign_id and creator_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        campaign = get_object_or_404(Campaign, id=campaign_id, brand_user=request.user)
        
        # Safely resolve CreatorProfile by profile PK or User PK
        creator_profile = CreatorProfile.objects.filter(id=creator_id).first()
        if not creator_profile:
            creator_profile = CreatorProfile.objects.filter(user_id=creator_id).first()
        if not creator_profile:
            return Response({"error": "Target creator profile not found."}, status=status.HTTP_404_NOT_FOUND)

        if campaign.status != 'active' or campaign.check_and_update_status():
            return Response({"error": "Direct offers can only be sent for active running campaigns."}, status=status.HTTP_400_BAD_REQUEST)

        submission_deadline = None
        if deadline_raw:
            submission_deadline = parse_datetime(deadline_raw)
        if not submission_deadline and deadline_hours:
            try:
                submission_deadline = timezone.now() + timedelta(hours=int(deadline_hours))
            except (ValueError, TypeError):
                pass

        # Check existing application
        application, created = CampaignApplication.objects.get_or_create(
            campaign=campaign,
            creator=creator_profile,
            defaults={
                'status': 'offered',
                'pitch': 'Direct campaign offer from brand.',
                'work_description': work_description,
                'submission_deadline': submission_deadline,
            }
        )

        if not created:
            if application.status in ['accepted', 'submitted', 'completed']:
                return Response({"error": "Creator is already hired for this campaign."}, status=status.HTTP_400_BAD_REQUEST)
            application.status = 'offered'
            if work_description:
                application.work_description = work_description
            if submission_deadline:
                application.submission_deadline = submission_deadline
            application.save()

        # Dispatch Nodemailer direct offer notification to creator
        try:
            brand_name = getattr(getattr(request.user, 'brand_profile', None), 'company_name', None) or request.user.username
            send_creator_direct_offer_notification(
                creator_profile.user.email,
                creator_profile.user.username,
                brand_name,
                campaign.title,
                campaign.points_reward
            )
        except Exception:
            pass

        return Response({
            "message": f"Offered campaign '{campaign.title}' to {creator_profile.user.username}!",
            "application": CampaignApplicationSerializer(application).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_application(self, request, pk=None):
        application = self.get_object()
        campaign = application.campaign

        if campaign.brand_user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        if application.status not in ['pending', 'offered']:
            return Response({"error": "Application can only be accepted if in pending or offered state."}, status=status.HTTP_400_BAD_REQUEST)

        # Capacity check
        if campaign.status == 'completed' or campaign.check_and_update_status():
            return Response({"error": "Campaign has already filled all available creator positions and is completed."}, status=status.HTTP_400_BAD_REQUEST)

        brand_profile = getattr(request.user, 'brand_profile', None)
        if not brand_profile:
            return Response({"error": "Brand profile missing."}, status=status.HTTP_400_BAD_REQUEST)

        if brand_profile.points_balance < campaign.points_reward:
            return Response({
                "error": f"Insufficient points balance. You need {campaign.points_reward} pts, but only have {brand_profile.points_balance} pts."
            }, status=status.HTTP_400_BAD_REQUEST)

        work_description = request.data.get('work_description')
        deadline_raw = request.data.get('submission_deadline')
        deadline_hours = request.data.get('deadline_hours')

        if work_description:
            application.work_description = work_description

        submission_deadline = None
        if deadline_raw:
            submission_deadline = parse_datetime(deadline_raw)
        if not submission_deadline and deadline_hours:
            try:
                submission_deadline = timezone.now() + timedelta(hours=int(deadline_hours))
            except (ValueError, TypeError):
                pass

        if submission_deadline:
            application.submission_deadline = submission_deadline

        application.status = 'accepted'
        application.save()

        # Update campaign status and auto-reject remaining applicants if full
        campaign_ended = campaign.check_and_update_status()

        # Dispatch Nodemailer decision notification to creator
        try:
            brand_name = getattr(getattr(request.user, 'brand_profile', None), 'company_name', None) or request.user.username
            deadline_str = application.submission_deadline.strftime("%Y-%m-%d %H:%M UTC") if application.submission_deadline else None
            send_creator_application_decision(
                application.creator.user.email,
                application.creator.user.username,
                campaign.title,
                brand_name,
                'accepted',
                application.work_description,
                deadline_str
            )
        except Exception:
            pass

        msg = "Application accepted! Creator is hired."
        if campaign_ended:
            msg += " All required slots are filled so the campaign has automatically ended."

        return Response({"message": msg}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='accept-offer')
    def accept_offer(self, request, pk=None):
        application = self.get_object()
        campaign = application.campaign

        if application.creator.user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        if application.status != 'offered':
            return Response({"error": "No pending offer found for this application."}, status=status.HTTP_400_BAD_REQUEST)

        # Capacity check
        if campaign.status == 'completed' or campaign.check_and_update_status():
            application.status = 'rejected'
            application.save()
            return Response({"error": "Sorry, all positions for this campaign have already been filled by other creators."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = 'accepted'
        application.save()

        # Update campaign status and auto-reject remaining applicants if full
        campaign_ended = campaign.check_and_update_status()

        # Dispatch Nodemailer offer response notifications to brand & creator
        try:
            brand_name = getattr(getattr(campaign.brand_user, 'brand_profile', None), 'company_name', None) or campaign.brand_user.username
            deadline_str = application.submission_deadline.strftime("%Y-%m-%d %H:%M UTC") if application.submission_deadline else None
            send_brand_offer_response_notification(
                campaign.brand_user.email,
                brand_name,
                application.creator.user.username,
                campaign.title,
                'accepted'
            )
            send_creator_application_decision(
                application.creator.user.email,
                application.creator.user.username,
                campaign.title,
                brand_name,
                'accepted',
                application.work_description,
                deadline_str
            )
        except Exception:
            pass

        msg = "Offer accepted! You are hired for this campaign."
        if campaign_ended:
            msg += " All required slots are filled so the campaign has automatically ended."

        return Response({"message": msg}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_application(self, request, pk=None):
        application = self.get_object()
        campaign = application.campaign
        
        # Either campaign brand owner or creator can reject
        if campaign.brand_user != request.user and application.creator.user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        was_offered = application.status == 'offered'
        is_by_creator = request.user == application.creator.user

        application.status = 'rejected'
        application.save()

        # Dispatch Nodemailer notification
        try:
            brand_name = getattr(getattr(campaign.brand_user, 'brand_profile', None), 'company_name', None) or campaign.brand_user.username
            if is_by_creator and was_offered:
                send_brand_offer_response_notification(
                    campaign.brand_user.email,
                    brand_name,
                    application.creator.user.username,
                    campaign.title,
                    'rejected'
                )
            else:
                send_creator_application_decision(
                    application.creator.user.email,
                    application.creator.user.username,
                    campaign.title,
                    brand_name,
                    'rejected'
                )
        except Exception:
            pass

        return Response({"message": "Application/offer rejected."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='submit-work')
    def submit_work(self, request, pk=None):
        application = self.get_object()

        if application.creator.user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        # Enforce automatic rejection if deadline has expired
        if application.check_and_update_deadline_status():
            return Response({
                "error": "The submission deadline for this work assignment has passed. The application has automatically expired and been rejected."
            }, status=status.HTTP_400_BAD_REQUEST)

        if application.status != 'accepted':
            return Response({"error": "Work can only be submitted for accepted campaigns in progress."}, status=status.HTTP_400_BAD_REQUEST)

        submission_link = request.data.get('submission_link')
        if not submission_link:
            return Response({"error": "Submission link is required."}, status=status.HTTP_400_BAD_REQUEST)

        application.submission_link = submission_link
        application.status = 'submitted'
        application.submitted_at = timezone.now()
        application.save()

        # Dispatch Nodemailer notifications to brand and creator
        try:
            brand_name = getattr(getattr(application.campaign.brand_user, 'brand_profile', None), 'company_name', None) or application.campaign.brand_user.username
            send_creator_work_submitted_confirmation(
                application.creator.user.email,
                application.creator.user.username,
                application.campaign.title,
                submission_link
            )
            send_brand_work_submitted_notification(
                application.campaign.brand_user.email,
                brand_name,
                application.creator.user.username,
                application.campaign.title,
                submission_link
            )
        except Exception:
            pass

        return Response({"message": "Work submitted successfully for brand review!"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='complete-and-pay')
    def complete_and_pay(self, request, pk=None):
        application = self.get_object()
        campaign = application.campaign

        if campaign.brand_user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        brand_profile = getattr(request.user, 'brand_profile', None)
        if not brand_profile:
            return Response({"error": "Brand profile missing."}, status=status.HTTP_400_BAD_REQUEST)

        creator = application.creator
        points = campaign.points_reward

        if application.status != 'submitted':
            return Response({"error": "Work must be submitted by the creator before completion."}, status=status.HTTP_400_BAD_REQUEST)

        # Parse Rating & Optional Feedback from Brand
        rating_input = request.data.get('rating', 5)
        feedback_input = request.data.get('feedback', '')

        try:
            rating_val = int(rating_input)
            rating_val = max(1, min(5, rating_val))
        except (ValueError, TypeError):
            rating_val = 5

        try:
            with transaction.atomic():
                brand_profile.refresh_from_db()
                if brand_profile.points_balance < points:
                    return Response({"error": "Insufficient points balance."}, status=status.HTTP_400_BAD_REQUEST)

                brand_profile.points_balance -= points
                brand_profile.save()

                creator.points_balance += points

                application.status = 'completed'
                application.rating = rating_val
                application.feedback = feedback_input
                application.save()

                # Recalculate exact average rating across all brand reviews for CreatorProfile
                completed_apps = CampaignApplication.objects.filter(creator=creator, status='completed', rating__isnull=False)
                if completed_apps.exists():
                    avg_val = completed_apps.aggregate(Avg('rating'))['rating__avg']
                    creator.rating = round(float(avg_val), 2) if avg_val is not None else 0.0
                    creator.total_ratings_count = completed_apps.count()
                else:
                    creator.rating = 0.0
                    creator.total_ratings_count = 0

                # Re-generate Creator embedding incorporating rating & feedback history
                text_to_embed = f"{creator.niche}. {creator.bio or ''}. Rating: {creator.rating} stars out of 5 across {creator.total_ratings_count} completed deals."
                if hasattr(embedding_model, 'encode'):
                    creator.embedding = embedding_model.encode(text_to_embed).tolist()

                creator.save()

                PointsTransaction.objects.create(
                    brand=brand_profile,
                    creator=creator,
                    campaign=campaign,
                    amount=points,
                    transaction_type='campaign_payout'
                )

            # Dispatch Nodemailer completion & review notifications
            try:
                brand_name = brand_profile.company_name if (brand_profile and brand_profile.company_name) else campaign.brand_user.username
                send_creator_reward_and_review_notification(
                    creator.user.email,
                    creator.user.username,
                    campaign.title,
                    brand_name,
                    points,
                    rating_val,
                    feedback_input
                )
                send_brand_completion_notification(
                    campaign.brand_user.email,
                    brand_name,
                    campaign.title,
                    creator.user.username,
                    points
                )
            except Exception:
                pass

            return Response({
                "message": f"Campaign completed! Rated creator {rating_val} ⭐ and transferred {points} points to {creator.user.username}.",
                "brand_remaining_points": brand_profile.points_balance,
                "creator_new_rating": creator.rating,
                "creator_total_ratings": creator.total_ratings_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Transaction failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='reject-work')
    def reject_work(self, request, pk=None):
        application = self.get_object()
        campaign = application.campaign

        if campaign.brand_user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        if application.status != 'submitted':
            return Response({"error": "Only submitted work can be rejected."}, status=status.HTTP_400_BAD_REQUEST)

        rejection_reason = request.data.get('rejection_reason', '').strip()
        if not rejection_reason:
            return Response({"error": "Please provide a reason for rejecting the submitted work."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = 'rejected'
        application.rejection_reason = rejection_reason
        application.save()

        # Send Email notification to Creator about Work Rejection with Reason
        try:
            brand_profile = getattr(request.user, 'brand_profile', None)
            brand_name = brand_profile.company_name if (brand_profile and brand_profile.company_name) else campaign.brand_user.username
            send_creator_work_rejected_notification(
                creator_email=application.creator.user.email,
                creator_username=application.creator.user.username,
                campaign_title=campaign.title,
                brand_name=brand_name,
                rejection_reason=rejection_reason
            )
        except Exception:
            pass

        return Response({
            "message": "Submitted work marked as rejected.",
            "rejection_reason": rejection_reason
        }, status=status.HTTP_200_OK)


# ==========================================
# 9. GLOBAL USER SEARCH AND MULTI-ATTRIBUTE SORTING
# ==========================================
class UserSearchAndSortView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        raw_query = request.query_params.get('q', '').strip()
        clean_q = raw_query.lstrip('@').strip()
        q_underscore = clean_q.replace(' ', '_')
        q_space = clean_q.replace('_', ' ')
        q_words = [w for w in clean_q.replace('_', ' ').split() if len(w) > 0]
        
        role_filter = request.query_params.get('role', '').strip()
        industry_filter = request.query_params.get('industry', '').strip()
        niche_filter = request.query_params.get('niche', '').strip()
        platform_filter = request.query_params.get('platform', '').strip()
        ordering = request.query_params.get('ordering', '').strip()

        # Attribute filter & sorting role scoping ONLY if search text is empty
        if not clean_q:
            if niche_filter or platform_filter or ordering in ['subscriber_count', '-subscriber_count', 'engagement_rate', '-engagement_rate', 'rating', '-rating']:
                if not role_filter:
                    role_filter = 'creator'
            elif industry_filter or ordering in ['company_size_asc', 'company_size_desc', 'company_size', '-company_size']:
                if not role_filter:
                    role_filter = 'brand'

        users_data = []

        # Creators Query
        if role_filter in ['', 'creator']:
            creators_qs = CreatorProfile.objects.select_related('user').all()

            if clean_q:
                direct_q = (
                    Q(user__username__iexact=clean_q) |
                    Q(user__username__iexact=q_underscore) |
                    Q(user__username__icontains=clean_q) |
                    Q(user__username__icontains=q_underscore) |
                    Q(user__email__iexact=clean_q) |
                    Q(name__icontains=clean_q) |
                    Q(name__icontains=q_space)
                )

                word_q = Q()
                for w in q_words:
                    word_q &= (
                        Q(user__username__icontains=w) |
                        Q(user__email__icontains=w) |
                        Q(name__icontains=w) |
                        Q(niche__icontains=w) |
                        Q(primary_platform__icontains=w) |
                        Q(bio__icontains=w)
                    )

                # Direct identity matches bypass dropdown niche/platform filters
                if niche_filter or platform_filter:
                    filtered_q = direct_q | (word_q & (
                        Q(niche__icontains=niche_filter) if niche_filter else Q()
                    ) & (
                        Q(primary_platform__icontains=platform_filter) if platform_filter else Q()
                    ))
                    creators_qs = creators_qs.filter(filtered_q)
                else:
                    creators_qs = creators_qs.filter(direct_q | word_q)
            else:
                if niche_filter:
                    creators_qs = creators_qs.filter(niche__icontains=niche_filter)
                if platform_filter:
                    creators_qs = creators_qs.filter(primary_platform__icontains=platform_filter)

            if ordering == 'subscriber_count':
                creators_qs = creators_qs.order_by('subscriber_count')
            elif ordering == '-subscriber_count':
                creators_qs = creators_qs.order_by('-subscriber_count')
            elif ordering == 'engagement_rate':
                creators_qs = creators_qs.order_by('engagement_rate')
            elif ordering == '-engagement_rate':
                creators_qs = creators_qs.order_by('-engagement_rate')
            elif ordering == 'rating':
                creators_qs = creators_qs.order_by('rating')
            elif ordering == '-rating':
                creators_qs = creators_qs.order_by('-rating')
            else:
                creators_qs = creators_qs.order_by('-rating', '-subscriber_count')

            for c in creators_qs:
                users_data.append({
                    "id": c.id,
                    "user_id": c.user.id,
                    "username": c.user.username,
                    "name": c.name or c.user.username,
                    "email": c.user.email,
                    "role": "creator",
                    "bio": c.bio,
                    "niche": c.niche,
                    "primary_platform": c.primary_platform,
                    "platform_link": c.platform_link,
                    "subscriber_count": c.subscriber_count,
                    "engagement_rate": float(c.engagement_rate or 0),
                    "avatar_url": c.avatar_url,
                    "location": c.location,
                    "social_links": c.social_links or {},
                    "points_balance": c.points_balance,
                    "rating": float(c.rating) if getattr(c, 'total_ratings_count', 0) > 0 else 0.0,
                    "total_ratings_count": getattr(c, 'total_ratings_count', 0),
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                })

        # Brands Query
        if role_filter in ['', 'brand']:
            brands_qs = BrandProfile.objects.select_related('user').all()

            if clean_q:
                direct_brand_q = (
                    Q(user__username__iexact=clean_q) |
                    Q(user__username__iexact=q_underscore) |
                    Q(user__username__icontains=clean_q) |
                    Q(user__username__icontains=q_underscore) |
                    Q(user__email__iexact=clean_q) |
                    Q(company_name__icontains=clean_q) |
                    Q(company_name__icontains=q_space)
                )

                word_brand_q = Q()
                for w in q_words:
                    word_brand_q &= (
                        Q(user__username__icontains=w) |
                        Q(user__email__icontains=w) |
                        Q(company_name__icontains=w) |
                        Q(industry__icontains=w) |
                        Q(bio__icontains=w)
                    )

                if industry_filter:
                    filtered_b = direct_brand_q | (word_brand_q & Q(industry__icontains=industry_filter))
                    brands_qs = brands_qs.filter(filtered_b)
                else:
                    brands_qs = brands_qs.filter(direct_brand_q | word_brand_q)
            else:
                if industry_filter:
                    brands_qs = brands_qs.filter(industry__icontains=industry_filter)

            brand_list = []
            for b in brands_qs:
                size_rank = 0
                sz = (b.company_size or '').lower()
                if '1-10' in sz: size_rank = 1
                elif '10-50' in sz or '11-50' in sz: size_rank = 2
                elif '50-250' in sz or '51-200' in sz: size_rank = 3
                elif '250' in sz or '500' in sz: size_rank = 4

                brand_list.append({
                    "id": b.id,
                    "user_id": b.user.id,
                    "username": b.user.username,
                    "name": b.company_name or b.user.username,
                    "email": b.user.email,
                    "role": "brand",
                    "company_name": b.company_name,
                    "bio": b.bio,
                    "industry": b.industry,
                    "website": b.website,
                    "logo_url": b.logo_url,
                    "company_size": b.company_size,
                    "size_rank": size_rank,
                    "target_audience": b.target_audience,
                    "location": b.location,
                    "social_links": b.social_links or {},
                    "points_balance": b.points_balance,
                    "created_at": b.created_at.isoformat() if b.created_at else None,
                })

            if ordering in ['company_size_asc', 'company_size']:
                brand_list.sort(key=lambda x: x['size_rank'])
            elif ordering in ['company_size_desc', '-company_size']:
                brand_list.sort(key=lambda x: x['size_rank'], reverse=True)

            users_data.extend(brand_list)

        return Response({"count": len(users_data), "results": users_data}, status=status.HTTP_200_OK)