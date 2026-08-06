from rest_framework import serializers
from .models import User, CreatorProfile, Campaign, BrandProfile, CampaignApplication, PointsTransaction


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class CreatorProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    role = serializers.ReadOnlyField(source='user.role')
    rating = serializers.SerializerMethodField()

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'username', 'email', 'role', 'name', 'bio', 'niche',
            'primary_platform', 'platform_link', 'subscriber_count',
            'engagement_rate', 'avatar_url', 'location', 'points_balance',
            'rating', 'total_ratings_count', 'social_links', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'points_balance', 'rating', 'total_ratings_count', 'created_at', 'updated_at']

    def get_rating(self, obj):
        if getattr(obj, 'total_ratings_count', 0) > 0 and getattr(obj, 'rating', None) is not None:
            return round(float(obj.rating), 2)
        return 0.0


class BrandProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username', default='')
    email = serializers.ReadOnlyField(source='user.email', default='')
    role = serializers.ReadOnlyField(source='user.role', default='brand')
    user_type = serializers.ReadOnlyField(source='user.role', default='brand')

    class Meta:
        model = BrandProfile
        fields = [
            'id', 'username', 'email', 'role', 'user_type', 'company_name',
            'bio', 'industry', 'website', 'logo_url', 'company_size', 'target_audience', 
            'location', 'social_links', 'points_balance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'user_type', 'points_balance', 'created_at', 'updated_at']

    def validate_website(self, value):
        if value and not (value.startswith('http://') or value.startswith('https://')):
            return f"https://{value}"
        return value


class CreatorMatchSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    similarity_score = serializers.FloatField(read_only=True, required=False)
    match_percentage = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'username', 'name', 'bio', 'niche', 'primary_platform', 
            'subscriber_count', 'engagement_rate', 'avatar_url', 
            'location', 'rating', 'total_ratings_count', 'social_links', 'similarity_score', 'match_percentage'
        ]

    def get_match_percentage(self, obj):
        score = getattr(obj, 'similarity_score', 0.85)
        return int(round(score * 100))

    def get_rating(self, obj):
        if getattr(obj, 'total_ratings_count', 0) > 0 and getattr(obj, 'rating', None) is not None:
            return round(float(obj.rating), 2)
        return 0.0


class CampaignSerializer(serializers.ModelSerializer):
    brand_username = serializers.ReadOnlyField(source='brand_user.username')
    brand_name = serializers.SerializerMethodField()
    accepted_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    end_datetime = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'brand_user', 'brand_username', 'brand_name', 'title', 'description', 
            'deliverables_format', 'points_reward', 'status', 'start_datetime', 'duration_hours', 'end_datetime',
            'target_platform', 'target_niche', 'min_subscribers_required', 'creators_needed', 
            'accepted_count', 'is_full', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'brand_user', 'embedding', 'created_at', 'updated_at']

    def to_representation(self, instance):
        instance.check_and_update_status()
        return super().to_representation(instance)

    def get_brand_name(self, obj):
        if hasattr(obj.brand_user, 'brand_profile') and obj.brand_user.brand_profile and obj.brand_user.brand_profile.company_name:
            return obj.brand_user.brand_profile.company_name
        return obj.brand_user.username

    def get_accepted_count(self, obj):
        return obj.applications.filter(status__in=['accepted', 'submitted', 'completed']).count()

    def get_is_full(self, obj):
        return self.get_accepted_count(obj) >= obj.creators_needed

    def get_end_datetime(self, obj):
        if obj.end_datetime:
            return obj.end_datetime.isoformat()
        return None


class CampaignApplicationSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source='creator.user.username')
    creator_name = serializers.ReadOnlyField(source='creator.name')
    creator_niche = serializers.ReadOnlyField(source='creator.niche')
    creator_avatar = serializers.ReadOnlyField(source='creator.avatar_url')
    campaign_title = serializers.ReadOnlyField(source='campaign.title')
    campaign_status = serializers.ReadOnlyField(source='campaign.status')
    campaign_end_datetime = serializers.SerializerMethodField()
    campaign_start_datetime = serializers.ReadOnlyField(source='campaign.start_datetime')
    points_reward = serializers.ReadOnlyField(source='campaign.points_reward')
    brand_username = serializers.ReadOnlyField(source='campaign.brand_user.username')
    brand_name = serializers.SerializerMethodField()

    class Meta:
        model = CampaignApplication
        fields = [
            'id', 'campaign', 'campaign_title', 'campaign_status', 'campaign_end_datetime', 'campaign_start_datetime',
            'brand_username', 'brand_name', 'creator', 
            'creator_username', 'creator_name', 'creator_niche', 'creator_avatar', 
            'pitch', 'work_description', 'submission_deadline', 'submission_link', 
            'rating', 'feedback', 'rejection_reason', 'status', 'points_reward', 'applied_at', 'updated_at', 'submitted_at'
        ]
        read_only_fields = ['id', 'creator', 'applied_at', 'updated_at']

    def to_representation(self, instance):
        instance.check_and_update_deadline_status()
        return super().to_representation(instance)

    def get_campaign_end_datetime(self, obj):
        if obj.campaign and obj.campaign.end_datetime:
            return obj.campaign.end_datetime.isoformat()
        return None

    def get_brand_name(self, obj):
        if hasattr(obj.campaign.brand_user, 'brand_profile') and obj.campaign.brand_user.brand_profile and obj.campaign.brand_user.brand_profile.company_name:
            return obj.campaign.brand_user.brand_profile.company_name
        return obj.campaign.brand_user.username


class PointsTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointsTransaction
        fields = '__all__'