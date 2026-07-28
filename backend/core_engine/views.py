from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from sentence_transformers import SentenceTransformer
from pgvector.django import CosineDistance

from .models import BrandProfile, CreatorProfile, Campaign
from .serializers import CampaignSerializer, CreatorMatchSerializer, CreatorProfileSerializer

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
            niche = data.get('niche', 'tech')

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
                bio=bio,
                niche=niche,
                primary_platform=data.get('primary_platform', 'youtube'),
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
# 4. CAMPAIGN CREATION & LISTING
# ==========================================
class CampaignCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Campaign.objects.filter(brand_user=self.request.user)

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

        if not creator.embedding:
            return Response({"error": "Creator embedding is missing."}, status=status.HTTP_400_BAD_REQUEST)

        filters = Q(min_subscribers_required__lte=creator.subscriber_count)
        
        if creator.primary_platform:
            filters &= Q(target_platform__iexact=creator.primary_platform)

        matched_campaigns = (
            Campaign.objects
            .filter(filters)
            .annotate(distance=CosineDistance("embedding", creator.embedding))
            .order_by("distance")[:10]
        )

        results = []
        for campaign in matched_campaigns:
            campaign_data = CampaignSerializer(campaign).data
            campaign_data['similarity_score'] = round(1 - campaign.distance, 4)
            results.append(campaign_data)

        return Response({
            "creator": creator.user.username,
            "matched_campaigns": results
        }, status=status.HTTP_200_OK)


# ==========================================
# 8. CREATOR PROFILE MANAGEMENT
# ==========================================
class CreatorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(CreatorProfile, user=request.user)
        serializer = CreatorProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile = get_object_or_404(CreatorProfile, user=request.user)
        serializer = CreatorProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            bio = serializer.validated_data.get('bio', profile.bio or '')
            niche = serializer.validated_data.get('niche', profile.niche or '')

            text_to_embed = f"{niche}. {bio}"
            vector_embedding = embedding_model.encode(text_to_embed).tolist()

            updated_profile = serializer.save(embedding=vector_embedding)
            return Response(CreatorProfileSerializer(updated_profile).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)