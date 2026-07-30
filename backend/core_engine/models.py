from django.db import models
from django.contrib.auth.models import AbstractUser
from pgvector.django import VectorField, HnswIndex


class User(AbstractUser):
    ROLE_CHOICES = (
        ('brand', 'Brand Entity'),
        ('creator', 'Creator Node'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='creator')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class CreatorProfile(models.Model):
    NICHE_CHOICES = (
        ('tech', 'Technology & AI'),
        ('gaming', 'Gaming & Esports'),
        ('lifestyle', 'Lifestyle & Vlogs'),
        ('fashion', 'Fashion & Beauty'),
        ('fitness', 'Fitness & Health'),
        ('finance', 'Finance & Investing'),
    )
    
    PLATFORM_CHOICES = (
        ('youtube', 'YouTube'),
        ('instagram', 'Instagram'),
        ('tiktok', 'TikTok'),
        ('twitch', 'Twitch'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='creator_profile')
    bio = models.TextField(blank=True, null=True)
    niche = models.CharField(max_length=50, choices=NICHE_CHOICES, default='tech')
    primary_platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='youtube')
    platform_link = models.URLField(blank=True, null=True)
    subscriber_count = models.IntegerField(default=0)
    engagement_rate = models.DecimalField(max_digits=4, decimal_places=2, default=2.50)
    avatar_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    points_balance = models.PositiveIntegerField(default=0)

    embedding = VectorField(dimensions=384, null=True, blank=True)

    class Meta:
        indexes = [
            HnswIndex(
                name='creator_vector_idx',
                fields=['embedding'],
                m=16,
                ef_construction=64,
                opclasses=['vector_cosine_ops']
            )
        ]

    def __str__(self):
        return f"Creator: {self.user.username} ({self.points_balance} pts)"


class BrandProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='brand_profile')
    company_name = models.CharField(max_length=255, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)
    target_audience = models.CharField(max_length=255, blank=True, null=True)
    points_balance = models.PositiveIntegerField(default=1000)

    def __str__(self):
        return f"Brand: {self.company_name or self.user.username} ({self.points_balance} pts)"


class Campaign(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    brand_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    title = models.CharField(max_length=200)
    description = models.TextField()
    points_reward = models.PositiveIntegerField(default=0, help_text="Points awarded to creator upon completion")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    target_platform = models.CharField(max_length=20, default='youtube')
    target_niche = models.CharField(max_length=50, default='tech')
    min_subscribers_required = models.IntegerField(default=0)
    creators_needed = models.IntegerField(default=1)
    
    embedding = VectorField(dimensions=384, null=True, blank=True)

    class Meta:
        indexes = [
            HnswIndex(
                name='campaign_vector_idx',
                fields=['embedding'],
                m=16,
                ef_construction=64,
                opclasses=['vector_cosine_ops']
            )
        ]

    def __str__(self):
        return f"Campaign: {self.title} ({self.brand_user.username} - {self.points_reward} pts)"


class CampaignApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted / Hired'),
        ('rejected', 'Rejected'),
        ('submitted', 'Work Submitted'),
        ('completed', 'Completed & Paid'),
    )

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='applications')
    creator = models.ForeignKey(CreatorProfile, on_delete=models.CASCADE, related_name='applications')
    pitch = models.TextField(blank=True, help_text="Why the creator is a good fit")
    submission_link = models.URLField(blank=True, null=True, help_text="Link to deliverable/content")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('campaign', 'creator')

    def __str__(self):
        return f"{self.creator.user.username} -> {self.campaign.title} [{self.status}]"


class PointsTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('campaign_payout', 'Campaign Payout'),
        ('admin_grant', 'Admin Grant'),
        ('top_up', 'Brand Top-Up'),
    )

    brand = models.ForeignKey(BrandProfile, on_delete=models.SET_NULL, null=True, blank=True)
    creator = models.ForeignKey(CreatorProfile, on_delete=models.SET_NULL, null=True, blank=True)
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.PositiveIntegerField()
    transaction_type = models.CharField(max_length=30, choices=TRANSACTION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} pts from Brand({self.brand}) to Creator({self.creator})"