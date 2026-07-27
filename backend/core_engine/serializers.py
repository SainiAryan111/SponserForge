from rest_framework import serializers
from .models import Campaign, CreatorProfile

class CampaignSerializer(serializers.ModelSerializer):
    brand_username = serializers.CharField(source='brand_user.username', read_only=True)

    class Meta:
        model = Campaign
        fields = [
            'id', 
            'brand_username', 
            'title', 
            'description', 
            'budget', 
            'target_platform', 
            'target_niche', 
            'min_subscribers_required',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class CreatorMatchSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    similarity_score = serializers.FloatField(read_only=True)

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 
            'username', 
            'niche', 
            'primary_platform', 
            'subscriber_count', 
            'bio', 
            'similarity_score'
        ]

class CreatorProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 
            'username', 
            'email', 
            'bio', 
            'primary_platform', 
            'niche', 
            'subscriber_count', 
            'engagement_rate'
        ]