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

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'username', 'email', 'role', 'name', 'bio', 'niche',
            'primary_platform', 'platform_link', 'subscriber_count',
            'engagement_rate', 'avatar_url', 'location', 'points_balance'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'points_balance']


class BrandProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username', default='')
    email = serializers.ReadOnlyField(source='user.email', default='')
    role = serializers.ReadOnlyField(source='user.role', default='brand')
    user_type = serializers.ReadOnlyField(source='user.role', default='brand')

    class Meta:
        model = BrandProfile
        fields = [
            'id', 'username', 'email', 'role', 'user_type', 'company_name',
            'industry', 'website', 'logo_url', 'company_size', 'target_audience', 'points_balance'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'user_type', 'points_balance']

    def validate_website(self, value):
        if value and not (value.startswith('http://') or value.startswith('https://')):
            return f"https://{value}"
        return value


class CreatorMatchSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    name = serializers.ReadOnlyField(source='name')
    similarity_score = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'username', 'name', 'bio', 'niche', 'primary_platform', 
            'subscriber_count', 'engagement_rate', 'avatar_url', 
            'location', 'similarity_score'
        ]


class CampaignSerializer(serializers.ModelSerializer):
    brand_username = serializers.ReadOnlyField(source='brand_user.username')
    accepted_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'brand_user', 'brand_username', 'title', 'description', 
            'points_reward', 'status', 'start_date', 'end_date', 'target_platform', 
            'target_niche', 'min_subscribers_required', 'creators_needed', 
            'accepted_count', 'is_full', 'created_at'
        ]
        read_only_fields = ['id', 'brand_user', 'embedding', 'created_at']

    def get_accepted_count(self, obj):
        return obj.applications.filter(status__in=['accepted', 'submitted', 'completed']).count()

    def get_is_full(self, obj):
        return self.get_accepted_count(obj) >= obj.creators_needed

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date must be after or equal to start date."})
        return data


class CampaignApplicationSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source='creator.user.username')
    creator_name = serializers.ReadOnlyField(source='creator.name')
    creator_niche = serializers.ReadOnlyField(source='creator.niche')
    creator_avatar = serializers.ReadOnlyField(source='creator.avatar_url')
    campaign_title = serializers.ReadOnlyField(source='campaign.title')
    points_reward = serializers.ReadOnlyField(source='campaign.points_reward')
    brand_username = serializers.ReadOnlyField(source='campaign.brand_user.username')

    class Meta:
        model = CampaignApplication
        fields = [
            'id', 'campaign', 'campaign_title', 'brand_username', 'creator', 
            'creator_username', 'creator_name', 'creator_niche', 'creator_avatar', 
            'pitch', 'submission_link', 'status', 'points_reward', 'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'applied_at', 'updated_at']


class PointsTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointsTransaction
        fields = '__all__'