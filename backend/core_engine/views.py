from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q

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
                target_audience=data.get('target_audience')
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
                embedding=vector_embedding
            )

        # 3. Generate JWT access keys
        refresh = RefreshToken.for_user(user)
        
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

        serializer.save(
            brand_user=self.request.user,
            embedding=vector
        )


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

        if not campaign.embedding:
            return Response({"error": "Campaign embedding is missing."}, status=status.HTTP_400_BAD_REQUEST)

        filters = Q(subscriber_count__gte=campaign.min_subscribers_required)
        
        if campaign.target_platform:
            filters &= Q(primary_platform__iexact=campaign.target_platform)

        matched_creators = (
            CreatorProfile.objects
            .filter(filters)
            .annotate(distance=CosineDistance("embedding", campaign.embedding))
            .order_by("distance")[:10]
        )

        for profile in matched_creators:
            profile.similarity_score = round(1 - profile.distance, 4)

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

        # 1. Build initial requirement filters
        filters = Q(min_subscribers_required__lte=creator.subscriber_count)
        
        if creator.primary_platform:
            filters &= Q(target_platform__iexact=creator.primary_platform)

        matched_campaigns = []

        # 2. Vector search if creator has an embedding
        if creator.embedding:
            matched_campaigns = list(
                Campaign.objects
                .filter(filters)
                .annotate(distance=CosineDistance("embedding", creator.embedding))
                .order_by("distance")[:10]
            )

        # 3. FALLBACK: If subscriber/platform filters exclude everything
        # or no vector matches are found, return recent active campaigns
        if not matched_campaigns:
            matched_campaigns = list(Campaign.objects.all().order_by('-created_at')[:10])

        # 4. Serialize and attach similarity scores safely
        results = []
        for campaign in matched_campaigns:
            campaign_data = CampaignSerializer(campaign).data
            
            if hasattr(campaign, 'distance') and campaign.distance is not None:
                campaign_data['similarity_score'] = round(1 - campaign.distance, 4)
            else:
                campaign_data['similarity_score'] = 0.50  # Default score for fallback matches

            results.append(campaign_data)

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
            return Campaign.objects.filter(brand_user=user).order_by('-created_at')
        return Campaign.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title', '')
        description = serializer.validated_data.get('description', '')
        niche = serializer.validated_data.get('target_niche', '')
        
        text_to_embed = f"{title}. {description}. Niche: {niche}"
        vector = embedding_model.encode(text_to_embed).tolist()

        serializer.save(
            brand_user=self.request.user,
            embedding=vector
        )

    def perform_update(self, serializer):
        title = serializer.validated_data.get('title', serializer.instance.title)
        description = serializer.validated_data.get('description', serializer.instance.description)
        niche = serializer.validated_data.get('target_niche', serializer.instance.target_niche)
        
        text_to_embed = f"{title}. {description}. Niche: {niche}"
        vector = embedding_model.encode(text_to_embed).tolist()

        serializer.save(embedding=vector)


class CampaignApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'brand':
            return CampaignApplication.objects.filter(campaign__brand_user=user).order_by('-applied_at')
        elif getattr(user, 'role', '') == 'creator':
            return CampaignApplication.objects.filter(creator__user=user).order_by('-applied_at')
        return CampaignApplication.objects.none()

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'creator_profile'):
            raise PermissionDenied("Only creators can apply to campaigns.")
        creator_profile = getattr(self.request.user, 'creator_profile')
        campaign = serializer.validated_data.get('campaign')

        # Capacity Check: Check if campaign slots are already full
        accepted_count = CampaignApplication.objects.filter(
            campaign=campaign,
            status__in=['accepted', 'submitted', 'completed']
        ).count()
        if accepted_count >= campaign.creators_needed:
            raise PermissionDenied("This campaign has already filled all available creator positions.")

        serializer.save(creator=creator_profile)

    @action(detail=False, methods=['post'], url_path='offer-campaign')
    def offer_campaign(self, request):
        if getattr(request.user, 'role', '') != 'brand':
            return Response({"error": "Only brand entities can send campaign offers."}, status=status.HTTP_403_FORBIDDEN)
        
        campaign_id = request.data.get('campaign_id')
        creator_id = request.data.get('creator_id')

        if not campaign_id or not creator_id:
            return Response({"error": "campaign_id and creator_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        campaign = get_object_or_404(Campaign, id=campaign_id, brand_user=request.user)
        creator_profile = get_object_or_404(CreatorProfile, id=creator_id)

        # Check existing application
        application, created = CampaignApplication.objects.get_or_create(
            campaign=campaign,
            creator=creator_profile,
            defaults={'status': 'offered', 'pitch': 'Direct campaign offer from brand.'}
        )

        if not created:
            if application.status in ['accepted', 'submitted', 'completed']:
                return Response({"error": "Creator is already hired for this campaign."}, status=status.HTTP_400_BAD_REQUEST)
            application.status = 'offered'
            application.save()

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
        accepted_count = CampaignApplication.objects.filter(
            campaign=campaign,
            status__in=['accepted', 'submitted', 'completed']
        ).count()

        if accepted_count >= campaign.creators_needed:
            return Response({"error": "Campaign has already filled all available creator positions."}, status=status.HTTP_400_BAD_REQUEST)

        brand_profile = getattr(request.user, 'brand_profile', None)
        if not brand_profile:
            return Response({"error": "Brand profile missing."}, status=status.HTTP_400_BAD_REQUEST)

        if brand_profile.points_balance < campaign.points_reward:
            return Response({
                "error": f"Insufficient points balance. You need {campaign.points_reward} pts, but only have {brand_profile.points_balance} pts."
            }, status=status.HTTP_400_BAD_REQUEST)

        application.status = 'accepted'
        application.save()

        accepted_count += 1

        # First-Come First-Served Race Condition logic:
        # If slots are now full, automatically reject remaining pending/offered applications!
        if accepted_count >= campaign.creators_needed:
            CampaignApplication.objects.filter(
                campaign=campaign,
                status__in=['pending', 'offered']
            ).exclude(id=application.id).update(status='rejected')

        return Response({"message": "Application accepted! Creator is hired."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='accept-offer')
    def accept_offer(self, request, pk=None):
        application = self.get_object()
        campaign = application.campaign

        if application.creator.user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        if application.status != 'offered':
            return Response({"error": "No pending offer found for this application."}, status=status.HTTP_400_BAD_REQUEST)

        # Capacity check
        accepted_count = CampaignApplication.objects.filter(
            campaign=campaign,
            status__in=['accepted', 'submitted', 'completed']
        ).count()

        if accepted_count >= campaign.creators_needed:
            application.status = 'rejected'
            application.save()
            return Response({"error": "Sorry, all positions for this campaign have already been filled by other creators."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = 'accepted'
        application.save()

        accepted_count += 1

        # If campaign slots are now full, auto-reject remaining pending/offered applicants
        if accepted_count >= campaign.creators_needed:
            CampaignApplication.objects.filter(
                campaign=campaign,
                status__in=['pending', 'offered']
            ).exclude(id=application.id).update(status='rejected')

        return Response({"message": "Offer accepted! You are hired for this campaign."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_application(self, request, pk=None):
        application = self.get_object()
        
        # Either campaign brand owner or creator can reject
        if application.campaign.brand_user != request.user and application.creator.user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        application.status = 'rejected'
        application.save()
        return Response({"message": "Application/offer rejected."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='submit-work')
    def submit_work(self, request, pk=None):
        application = self.get_object()

        if application.creator.user != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        if application.status != 'accepted':
            return Response({"error": "Work can only be submitted for accepted campaigns."}, status=status.HTTP_400_BAD_REQUEST)

        submission_link = request.data.get('submission_link')
        if not submission_link:
            return Response({"error": "Submission link is required."}, status=status.HTTP_400_BAD_REQUEST)

        application.submission_link = submission_link
        application.status = 'submitted'
        application.save()
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

        try:
            with transaction.atomic():
                brand_profile.refresh_from_db()
                if brand_profile.points_balance < points:
                    return Response({"error": "Insufficient points balance."}, status=status.HTTP_400_BAD_REQUEST)

                brand_profile.points_balance -= points
                brand_profile.save()

                creator.points_balance += points
                creator.save()

                application.status = 'completed'
                application.save()

                PointsTransaction.objects.create(
                    brand=brand_profile,
                    creator=creator,
                    campaign=campaign,
                    amount=points,
                    transaction_type='campaign_payout'
                )

            return Response({
                "message": f"Campaign completed! Transferred {points} points to {creator.user.username}.",
                "brand_remaining_points": brand_profile.points_balance
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Transaction failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==========================================
# 9. GLOBAL USER SEARCH AND MULTI-ATTRIBUTE SORTING
# ==========================================
class UserSearchAndSortView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        role_filter = request.query_params.get('role', '').strip()
        industry_filter = request.query_params.get('industry', '').strip()
        niche_filter = request.query_params.get('niche', '').strip()
        platform_filter = request.query_params.get('platform', '').strip()
        ordering = request.query_params.get('ordering', '').strip()

        # Attribute filter & sorting role scoping
        if niche_filter or platform_filter or ordering in ['subscriber_count', '-subscriber_count', 'engagement_rate', '-engagement_rate']:
            if not role_filter:
                role_filter = 'creator'
        elif industry_filter or ordering in ['company_size_asc', 'company_size_desc']:
            if not role_filter:
                role_filter = 'brand'

        users_data = []

        # Creators Query
        if role_filter in ['', 'creator']:
            creators_qs = CreatorProfile.objects.select_related('user').all()

            if query:
                creators_qs = creators_qs.filter(
                    Q(user__username__icontains=query) | 
                    Q(name__icontains=query) |
                    Q(bio__icontains=query)
                )

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
            else:
                creators_qs = creators_qs.order_by('-subscriber_count')

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
                    "points_balance": c.points_balance
                })

        # Brands Query
        if role_filter in ['', 'brand']:
            brands_qs = BrandProfile.objects.select_related('user').all()

            if query:
                brands_qs = brands_qs.filter(
                    Q(user__username__icontains=query) | 
                    Q(company_name__icontains=query) |
                    Q(industry__icontains=query)
                )

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
                    "industry": b.industry,
                    "website": b.website,
                    "logo_url": b.logo_url,
                    "company_size": b.company_size,
                    "size_rank": size_rank,
                    "target_audience": b.target_audience,
                    "points_balance": b.points_balance
                })

            if ordering == 'company_size_asc':
                brand_list.sort(key=lambda x: x['size_rank'])
            elif ordering == 'company_size_desc':
                brand_list.sort(key=lambda x: x['size_rank'], reverse=True)

            users_data.extend(brand_list)

        return Response({"count": len(users_data), "results": users_data}, status=status.HTTP_200_OK)