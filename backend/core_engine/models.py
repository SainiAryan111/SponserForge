from datetime import timedelta, datetime, time
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
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
    name = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    niche = models.CharField(max_length=255, default='tech')
    primary_platform = models.CharField(max_length=255, default='youtube')
    platform_link = models.URLField(blank=True, null=True)
    subscriber_count = models.IntegerField(default=0)
    engagement_rate = models.DecimalField(max_digits=4, decimal_places=2, default=2.50)
    avatar_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    points_balance = models.PositiveIntegerField(default=0)
    rating = models.FloatField(default=5.0, help_text="Average brand rating (1.0 to 5.0)")
    total_ratings_count = models.PositiveIntegerField(default=0, help_text="Total number of brand ratings received")
    social_links = models.JSONField(default=dict, blank=True, null=True, help_text="Social media profiles dict e.g. {'twitter': '...', 'instagram': '...'}")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

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
        return f"Creator: {self.name or self.user.username} ({self.points_balance} pts)"


class BrandProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='brand_profile')
    company_name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True, null=True, help_text="Company overview & mission statement")
    industry = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)
    target_audience = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    social_links = models.JSONField(default=dict, blank=True, null=True, help_text="Brand social channels")
    points_balance = models.PositiveIntegerField(default=1000)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"Brand: {self.company_name or self.user.username} ({self.points_balance} pts)"


class Campaign(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    brand_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    title = models.CharField(max_length=200)
    description = models.TextField()
    deliverables_format = models.CharField(max_length=255, blank=True, null=True, default="Sponsored Video / Post", help_text="Content format required")
    points_reward = models.PositiveIntegerField(default=0, help_text="Points awarded to creator upon completion")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_datetime = models.DateTimeField(null=True, blank=True, help_text="Exact launch date and time")
    duration_hours = models.PositiveIntegerField(default=24, null=True, blank=True, help_text="Campaign duration in hours")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    target_platform = models.CharField(max_length=100, default='youtube')
    target_niche = models.CharField(max_length=100, default='tech')
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

    @property
    def end_datetime(self):
        if self.start_datetime and self.duration_hours:
            return self.start_datetime + timedelta(hours=self.duration_hours)
        return None

    def check_and_update_status(self):
        now = timezone.now()

        # 1. Scheduled -> Active transition when launch starting time arrives
        if self.status == 'scheduled' and self.start_datetime:
            if now >= self.start_datetime:
                self.status = 'active'
                self.save(update_fields=['status'])

        # 2. Active -> Completed transition when campaign duration expires
        if self.status == 'active' and self.start_datetime and self.duration_hours:
            end_time = self.start_datetime + timedelta(hours=self.duration_hours)
            if now >= end_time:
                self.status = 'completed'
                self.save(update_fields=['status'])
                self.applications.filter(status__in=['pending', 'offered']).update(status='rejected')

        # 3. Active -> Completed transition when required creators count is reached
        accepted_count = self.applications.filter(status__in=['accepted', 'submitted', 'completed']).count()
        if accepted_count >= self.creators_needed:
            if self.status != 'completed':
                self.status = 'completed'
                self.save(update_fields=['status'])
            # Automatically mark remaining pending/offered applications as rejected
            self.applications.filter(status__in=['pending', 'offered']).update(status='rejected')
            return True

        return self.status == 'completed'

    def __str__(self):
        return f"Campaign: {self.title} ({self.brand_user.username} - {self.points_reward} pts)"


class CampaignApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('offered', 'Offered by Brand'),
        ('accepted', 'Accepted / Hired'),
        ('rejected', 'Rejected'),
        ('submitted', 'Work Submitted'),
        ('completed', 'Completed & Paid'),
    )

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='applications')
    creator = models.ForeignKey(CreatorProfile, on_delete=models.CASCADE, related_name='applications')
    pitch = models.TextField(blank=True, help_text="Why the creator is a good fit")
    work_description = models.TextField(blank=True, null=True, help_text="Deliverable instructions set by Brand")
    submission_deadline = models.DateTimeField(blank=True, null=True, help_text="Deadline date & time to submit work")
    submission_link = models.URLField(blank=True, null=True, help_text="Link to deliverable/content")
    rating = models.PositiveIntegerField(blank=True, null=True, help_text="Rating given by Brand upon completion (1 to 5 stars)")
    feedback = models.TextField(blank=True, null=True, help_text="Feedback/review written by Brand upon completion")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('campaign', 'creator')

    def check_and_update_deadline_status(self):
        """
        If submission deadline has passed and creator hasn't submitted work yet,
        automatically mark application as rejected.
        """
        if self.status in ['accepted', 'offered'] and self.submission_deadline:
            if timezone.now() > self.submission_deadline:
                self.status = 'rejected'
                self.save(update_fields=['status'])
                return True
        return False

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