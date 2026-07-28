from django.db import models
from django.contrib.auth.models import AbstractUser
from pgvector.django import VectorField, HnswIndex

# ==========================================
# 1. CORE USER MODEL
# ==========================================
class User(AbstractUser):
    ROLE_CHOICES = (
        ('brand', 'Brand Entity'),
        ('creator', 'Creator Node'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='creator')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# ==========================================
# 2. CREATOR PROFILE
# ==========================================
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
    engagement_rate = models.DecimalField(max_digits=4, decimal_places=2, default=2.50)  # e.g., 4.50%
    avatar_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)

    embedding = VectorField(dimensions=384, null=True, blank=True)

    class Meta:
        indexes = [
            HnswIndex(
                name='creator_vector_idx',
                fields=['embedding'],
                m=16,
                ef_construction=64,
                opclasses=['vector_cosine_ops']  # Fast Cosine Similarity
            )
        ]

    def __str__(self):
        return f"Creator: {self.user.username}"


# ==========================================
# 3. BRAND PROFILE
# ==========================================
class BrandProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='brand_profile')
    company_name = models.CharField(max_length=255, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)
    target_audience = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Brand: {self.company_name or self.user.username}"


# ==========================================
# 4. CAMPAIGN
# ==========================================
class Campaign(models.Model):
    brand_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    title = models.CharField(max_length=200)
    description = models.TextField()  # Converts into vector embedding
    budget = models.DecimalField(max_digits=10, decimal_places=2)  # FIXED FIELD TYPE
    target_platform = models.CharField(max_length=20, default='youtube')
    target_niche = models.CharField(max_length=50, default='tech')
    min_subscribers_required = models.IntegerField(default=0)
    
    # 384-dimensional vector field for the campaign description
    embedding = VectorField(dimensions=384, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
        return f"Campaign: {self.title} ({self.brand_user.username})"


# ==========================================
# 4. CAMPAIGN BRIEF (Legacy Alias)
# ==========================================
class CampaignBrief(models.Model):
    brand = models.ForeignKey(BrandProfile, on_delete=models.CASCADE, related_name='campaigns_brief')
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    required_niche = models.CharField(max_length=50, default='tech')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title