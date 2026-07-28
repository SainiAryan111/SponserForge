from rest_framework import serializers
from .models import User, CreatorProfile, BrandProfile, Campaign

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class CreatorProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'user', 'username', 'bio', 'niche', 
            'primary_platform', 'platform_link', 'subscriber_count', 
            'engagement_rate', 'avatar_url', 'location'
        ]
        read_only_fields = ['id', 'user', 'embedding']

class CreatorMatchSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    similarity_score = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'username', 'bio', 'niche', 'primary_platform', 
            'subscriber_count', 'engagement_rate', 'avatar_url', 
            'location', 'similarity_score'
        ]

class CampaignSerializer(serializers.ModelSerializer):
    brand_username = serializers.ReadOnlyField(source='brand_user.username')

    class Meta:
        model = Campaign
        fields = [
            'id', 'brand_user', 'brand_username', 'title', 'description', 
            'budget', 'target_platform', 'target_niche', 
            'min_subscribers_required', 'created_at'
        ]
        read_only_fields = ['id', 'brand_user', 'embedding', 'created_at']