from rest_framework import serializers
from .models import User, CreatorProfile, Campaign

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

# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import BrandProfile

User = get_user_model()


class BrandProfileSerializer(serializers.ModelSerializer):
    # Fetch from user.role instead of user.user_type
    username = serializers.ReadOnlyField(source='user.username', default='')
    email = serializers.ReadOnlyField(source='user.email', default='')
    role = serializers.ReadOnlyField(source='user.role', default='brand')
    user_type = serializers.ReadOnlyField(source='user.role', default='brand') # Alias for React components

    class Meta:
        model = BrandProfile
        fields = [
            'id',
            'username',
            'email',
            'role',
            'user_type',
            'company_name',
            'industry',
            'website',
            'logo_url',
            'company_size',
            'target_audience',
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'user_type']

    def validate_website(self, value):
        """Ensure website has proper URL formatting if provided."""
        if value and not (value.startswith('http://') or value.startswith('https://')):
            return f"https://{value}"
        return value