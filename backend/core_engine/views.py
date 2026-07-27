from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from sentence_transformers import SentenceTransformer
from pgvector.django import CosineDistance

from .models import BrandProfile, CreatorProfile, Campaign
from .serializers import CampaignSerializer, CreatorMatchSerializer, CreatorProfileSerializer

User = get_user_model()

# Load model once at startup globally
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')


# --- 1. SIGNUP VIEW ---
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

            # Generate initial 384-dimensional vector embedding for AI vector search matching
            text_to_embed = f"{niche}. {bio}".strip()
            vector_embedding = model.encode(text_to_embed).tolist() if text_to_embed else None

            CreatorProfile.objects.create(
                user=user,
                bio=bio,
                niche=niche,
                primary_platform=data.get('primary_platform', 'youtube'),
                platform_link=data.get('platform_link'),
                subscriber_count=int(data.get('subscriber_count') or 0),
                engagement_rate=float(data.get('engagement_rate') or 2.50),
                location=data.get('location'),
                embedding=vector_embedding
            )

        # 3. Generate real JWT access keys
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


# --- 2. LOGIN VIEW ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    requested_role = request.data.get('role')  # 'brand' or 'creator'

    user = authenticate(username=username, password=password)
    
    if user is not None:
        if user.role != requested_role:
            return Response({
                "error": f"Access Denied. This account is registered as a {user.role.capitalize()}, not a {requested_role.capitalize()}."
            }, status=status.HTTP_403_FORBIDDEN)
            
        # Generate real JWT token pair
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Authentication successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "role": user.role
        }, status=status.HTTP_200_OK)
        
    return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)


# --- 3. MATCH CREATORS DIRECT SEARCH ---
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

        query_vector = model.encode(query).tolist()

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


# --- 4. PROTECTED CAMPAIGN CREATION ---
class CampaignCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CampaignSerializer(data=request.data)
        if serializer.is_valid():
            description = serializer.validated_data.get('description', '')
            title = serializer.validated_data.get('title', '')
            
            text_to_embed = f"{title}. {description}"
            vector_embedding = model.encode(text_to_embed).tolist()

            # Assign logged-in brand user cleanly from JWT authentication
            campaign = serializer.save(brand_user=request.user, embedding=vector_embedding)
            return Response(CampaignSerializer(campaign).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- 5. MATCHING CREATORS FOR CAMPAIGN ---
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


# --- 6. MATCH CAMPAIGNS FOR CREATOR ---
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


# --- CREATOR PROFILE ONBOARDING VIEW ---
class CreatorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Fetch the logged-in creator's profile."""
        profile = get_object_or_404(CreatorProfile, user=request.user)
        serializer = CreatorProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Update creator profile and generate vector embedding automatically."""
        profile = get_object_or_404(CreatorProfile, user=request.user)
        serializer = CreatorProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            bio = serializer.validated_data.get('bio', profile.bio or '')
            niche = serializer.validated_data.get('niche', profile.niche or '')

            # Generate 384-dimensional vector embedding for the creator
            text_to_embed = f"{niche}. {bio}"
            vector_embedding = model.encode(text_to_embed).tolist()

            updated_profile = serializer.save(embedding=vector_embedding)
            return Response(CreatorProfileSerializer(updated_profile).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)