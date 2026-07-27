import os
import sys
import random
from django.core.management import call_command

# Get path to D:\Project\SponserForge\backend
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

# Points to core/settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from sentence_transformers import SentenceTransformer
from core_engine.models import BrandProfile, CreatorProfile, Campaign

User = get_user_model()

print("Wiping existing database and resetting ID sequences...")
call_command('flush', verbosity=0, interactive=False)
print("Database cleared. IDs will restart at 1.")

print("Loading SentenceTransformer model...")
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Niche Data Templates
CREATOR_DATA = [
    # Tech
    ("tech_coder_dev", "Tech", "youtube", "Python developer building open-source tools, AI projects, and web development tutorials."),
    ("code_with_sam", "Tech", "youtube", "Software engineer sharing React, Django, and cloud computing best practices."),
    ("tech_review_guy", "Tech", "youtube", "Unboxing and reviewing laptops, smartphones, keyboards, and consumer electronics."),
    ("dev_ops_dan", "Tech", "youtube", "Docker, Kubernetes, and backend infrastructure tutorials for software engineering teams."),
    ("ai_daily_pulse", "Tech", "instagram", "Daily posts breaking down AI research, machine learning tools, and startup news."),
    ("data_science_maya", "Tech", "youtube", "Data science vlogs, SQL tutorials, machine learning project walk-throughs."),
    ("mobile_app_mike", "Tech", "youtube", "iOS and Android app development using Flutter and React Native."),
    ("cyber_security_pro", "Tech", "youtube", "Ethical hacking, cybersecurity fundamentals, and privacy-focused software reviews."),
    
    # Fitness & Health
    ("marcus_fit_life", "Fitness", "instagram", "Certified strength coach sharing workout routines, gym nutrition, and supplement reviews."),
    ("yoga_with_elena", "Fitness", "youtube", "Daily yoga practices, mobility flows, and mindfulness routines for beginners."),
    ("runner_cross_fit", "Fitness", "instagram", "Marathon training logs, shoe reviews, and functional fitness tips."),
    ("keto_kitchen_chef", "Fitness", "youtube", "Healthy meal prep tutorials, low-carb recipes, and fitness nutrition advice."),
    ("calisthenics_king", "Fitness", "instagram", "Bodyweight workout progressions, muscle-up tutorials, and athletic training."),
    ("physio_health_doc", "Fitness", "youtube", "Physical therapy exercises, posture fixes, and injury prevention guides."),
    ("crossfit_claire", "Fitness", "instagram", "High intensity interval training, barbell routines, and fitness gear tests."),
    ("daily_pilates_hub", "Fitness", "instagram", "Pilates routines for core strength, flexibility, and overall wellness."),

    # Gaming
    ("cyber_sam_gaming", "Gaming", "youtube", "Live streamer playing action RPGs, strategy games, and reviewing gaming hardware."),
    ("fps_legend_alex", "Gaming", "youtube", "Competitive first-person shooter esports gameplay, strategy guides, and mouse reviews."),
    ("indie_game_spotlight", "Gaming", "youtube", "In-depth reviews and commentary on upcoming independent video game releases."),
    ("cozy_gamer_kat", "Gaming", "instagram", "Cozy gaming setup ideas, Nintendo Switch game reviews, and aesthetic desk setups."),
    ("retro_gaming_vault", "Gaming", "youtube", "Restoring vintage gaming consoles and reviewing classic arcade games."),
    ("rpg_master_vince", "Gaming", "youtube", "Lore deep-dives, strategy guides, and build walk-throughs for open-world RPGs."),

    # Beauty & Fashion
    ("style_by_sophia", "Fashion", "instagram", "Modern streetwear fashion, seasonal wardrobe outfit ideas, and thrift store hauls."),
    ("beauty_glow_claire", "Beauty", "instagram", "Skincare routine breakdowns, makeup tutorials, and honest beauty product reviews."),
    ("sneaker_head_jake", "Fashion", "youtube", "Unboxing limited-edition sneakers, streetwear culture news, and shoe care guides."),
    ("glam_by_monica", "Beauty", "youtube", "High-fashion makeup looks, bridal beauty, and drug-store product comparisons."),
    ("sustainable_style_co", "Fashion", "instagram", "Eco-friendly wardrobe choices, vintage clothing, and sustainable brand reviews."),

    # Finance & Business
    ("wealth_wise_investing", "Finance", "youtube", "Personal finance guides, stock market investing, index funds, and passive income."),
    ("crypto_market_daily", "Finance", "youtube", "Web3 developments, crypto market breakdown, and blockchain technology explainers."),
    ("real_estate_ryan", "Finance", "youtube", "First-time home buyer advice, real estate investing, and property management."),
    ("frugal_living_hacks", "Finance", "instagram", "Budgeting strategies, saving money advice, and sensible financial planning."),

    # Food & Lifestyle
    ("chef_marco_bites", "Food", "youtube", "Quick 15-minute dinner recipes, Italian cooking techniques, and kitchen gear reviews."),
    ("travel_with_tara", "Lifestyle", "youtube", "Solo travel vlogs, budget backpacking guides, and digital nomad lifestyle tips."),
    ("coffee_roaster_lab", "Food", "instagram", "Espresso extraction guides, specialty coffee reviews, and home brewing equipment."),
    ("plant_based_plates", "Food", "instagram", "Delicious vegan and vegetarian meal recipes for everyday cooking.")
]

CAMPAIGN_DATA = [
    ("SaaS AI Code Assistant Launch", "Seeking tech creators to showcase our AI code auto-completion plugin in a 60-second video integration.", 2500, "youtube", "Tech", 10000),
    ("Next-Gen Wireless Gaming Headset", "Unboxing and audio testing campaign for a brand-new low-latency gaming headset with active noise cancellation.", 1800, "youtube", "Gaming", 15000),
    ("Organic Whey Protein Powder", "Fitness influencers needed to demonstrate daily smoothie recipes using our ultra-clean organic whey isolate.", 1200, "instagram", "Fitness", 5000),
    ("Ergonomic Standing Desk Review", "Looking for tech, gaming, or productivity creators to feature our motorized standing desk in a setup video.", 3000, "youtube", "Tech", 20000),
    ("Hydration & Electrolyte Powder", "Endurance runners and fitness enthusiasts to promote clean sugar-free electrolyte drink mixes.", 800, "instagram", "Fitness", 8000),
    ("Smart Watch Fitness Tracker", "Seeking health and athletic creators to review our 24/7 heart-rate and sleep tracking smartwatch.", 2200, "youtube", "Fitness", 12000),
    ("Indie Tactical RPG Release", "Streamers and gaming YouTubers wanted for sponsored gameplay sessions during our launch weekend.", 1500, "youtube", "Gaming", 10000),
    ("Sustainable Cotton Streetwear Line", "Fashion creators needed for an Instagram aesthetic try-on haul featuring eco-friendly hoodies and tees.", 1000, "instagram", "Fashion", 15000),
    ("Clean Skincare Hydration Serum", "Beauty creators to produce high-quality reel/video showing 7-day skincare hydration transformation.", 1400, "instagram", "Beauty", 10000),
    ("Automated Personal Budgeting App", "Finance Youtubers to explain our automated savings app that helps young professionals invest effortlessly.", 3500, "youtube", "Finance", 25000)
]

def populate_database():
    print("Populating Creators...")
    creators_created = 0
    for username, niche, platform, bio in CREATOR_DATA:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': f"{username}@example.com", 'role': 'creator'}
        )
        if created:
            user.set_password("SecurePassword123!")
            user.save()

        profile, _ = CreatorProfile.objects.get_or_create(user=user)
        profile.bio = bio
        profile.primary_platform = platform
        profile.niche = niche
        profile.subscriber_count = random.randint(5000, 250000)
        profile.engagement_rate = round(random.uniform(1.8, 6.5), 2)

        # Generate 384-dim vector embedding
        text_to_embed = f"{niche}. {bio}"
        profile.embedding = model.encode(text_to_embed).tolist()
        profile.save()
        creators_created += 1

    print(f"Successfully populated {creators_created} creators.")

    print("Populating Brand & Campaigns...")
    brand_user, _ = User.objects.get_or_create(
        username="global_brand_agency",
        defaults={'email': "agency@globalbrand.com", 'role': 'brand'}
    )
    if _:
        brand_user.set_password("SecurePassword123!")
        brand_user.save()
        BrandProfile.objects.get_or_create(user=brand_user)

    campaigns_created = 0
    for title, desc, budget, platform, niche, min_subs in CAMPAIGN_DATA:
        text_to_embed = f"{title}. {desc}"
        vector_embedding = model.encode(text_to_embed).tolist()

        Campaign.objects.create(
            brand_user=brand_user,
            title=title,
            description=desc,
            budget=budget,
            target_platform=platform,
            target_niche=niche,
            min_subscribers_required=min_subs,
            embedding=vector_embedding
        )
        campaigns_created += 1

    print(f"Successfully populated {campaigns_created} campaigns.")
    print("Database seeding completed! All IDs started from 1.")

if __name__ == "__main__":
    populate_database()