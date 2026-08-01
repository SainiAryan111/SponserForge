import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from core_engine.models import User, CreatorProfile, BrandProfile, Campaign, CampaignApplication, PointsTransaction
from django.db.models import Avg

def sanitize_database():
    print("=== STARTING DATABASE DATA SANITIZATION & VALUE CONSISTENCY CHECK ===")
    
    # 1. Sanitize & Ensure User Profiles exist for every User
    users = User.objects.all()
    print(f"[Users] Total users found: {users.count()}")
    for user in users:
        # Ensure role is set
        if not user.role:
            user.role = 'creator'
            user.save(update_fields=['role'])

        if user.role == 'creator':
            profile, created = CreatorProfile.objects.get_or_create(user=user)
            if created:
                print(f"  -> Created missing CreatorProfile for user @{user.username}")
        elif user.role == 'brand':
            profile, created = BrandProfile.objects.get_or_create(user=user)
            if created:
                print(f"  -> Created missing BrandProfile for user @{user.username}")

    # 2. Sanitize CreatorProfile Values
    creators = CreatorProfile.objects.all()
    print(f"\n[CreatorProfiles] Total creator profiles: {creators.count()}")
    for c in creators:
        updated = False

        if not c.name or not c.name.strip():
            c.name = c.user.username.capitalize()
            updated = True

        if not c.niche or not c.niche.strip():
            c.niche = 'tech'
            updated = True
        else:
            c.niche = c.niche.strip().lower()

        if not c.primary_platform or not c.primary_platform.strip():
            c.primary_platform = 'youtube'
            updated = True
        else:
            c.primary_platform = c.primary_platform.strip().lower()

        if c.subscriber_count is None or c.subscriber_count < 0:
            c.subscriber_count = 0
            updated = True

        if c.engagement_rate is None or c.engagement_rate < 0:
            c.engagement_rate = 2.50
            updated = True

        if c.rating is None or c.rating <= 0:
            c.rating = 5.0
            updated = True

        if c.total_ratings_count is None:
            c.total_ratings_count = 0
            updated = True

        if c.social_links is None:
            c.social_links = {}
            updated = True

        # Recalculate average rating if completed applications with ratings exist
        completed_apps = CampaignApplication.objects.filter(creator=c, status='completed', rating__isnull=False)
        if completed_apps.exists():
            avg_val = completed_apps.aggregate(Avg('rating'))['rating__avg']
            if avg_val:
                c.rating = round(float(avg_val), 2)
                c.total_ratings_count = completed_apps.count()
                updated = True

        if updated:
            c.save()
            print(f"  -> Updated CreatorProfile for @{c.user.username} (Rating: {c.rating}, Subs: {c.subscriber_count})")

    # 3. Sanitize BrandProfile Values
    brands = BrandProfile.objects.all()
    print(f"\n[BrandProfiles] Total brand profiles: {brands.count()}")
    for b in brands:
        updated = False

        if not b.company_name or not b.company_name.strip():
            b.company_name = b.user.username.replace('_', ' ').title()
            updated = True

        if not b.industry or not b.industry.strip():
            b.industry = 'General'
            updated = True

        if not b.company_size or not b.company_size.strip():
            b.company_size = '10-50'
            updated = True

        if b.points_balance is None:
            b.points_balance = 1000
            updated = True

        if b.social_links is None:
            b.social_links = {}
            updated = True

        if updated:
            b.save()
            print(f"  -> Updated BrandProfile for @{b.user.username} ({b.company_name})")

    # 4. Sanitize Campaign Values & Statuses
    campaigns = Campaign.objects.all()
    print(f"\n[Campaigns] Total campaigns found: {campaigns.count()}")
    for cmp in campaigns:
        updated = False

        if not cmp.title or not cmp.title.strip():
            cmp.title = "Untitled Sponsor Campaign"
            updated = True

        if not cmp.description or not cmp.description.strip():
            cmp.description = "No campaign description provided."
            updated = True

        if not cmp.deliverables_format or not cmp.deliverables_format.strip():
            cmp.deliverables_format = "Sponsored Video / Post"
            updated = True

        if cmp.target_niche:
            cmp.target_niche = cmp.target_niche.strip().lower()

        if cmp.target_platform:
            cmp.target_platform = cmp.target_platform.strip().lower()

        if cmp.points_reward is None or cmp.points_reward <= 0:
            cmp.points_reward = 100
            updated = True

        if cmp.min_subscribers_required is None or cmp.min_subscribers_required < 0:
            cmp.min_subscribers_required = 0
            updated = True

        if cmp.creators_needed is None or cmp.creators_needed <= 0:
            cmp.creators_needed = 1
            updated = True

        if not cmp.start_datetime:
            cmp.start_datetime = cmp.created_at or timezone.now()
            updated = True

        if not cmp.duration_hours or cmp.duration_hours <= 0:
            cmp.duration_hours = 24
            updated = True

        if updated:
            cmp.save()
            print(f"  -> Updated Campaign parameters for: '{cmp.title}' (ID: {cmp.id})")

        # Run status transitions logic
        cmp.check_and_update_status()

    # 5. Sanitize CampaignApplications
    applications = CampaignApplication.objects.all()
    print(f"\n[CampaignApplications] Total applications found: {applications.count()}")
    for app in applications:
        app.check_and_update_deadline_status()

    print("\n=== DATABASE SANITIZATION & CONSISTENCY CHECK COMPLETED SUCCESSFULLY ===")

if __name__ == '__main__':
    sanitize_database()
