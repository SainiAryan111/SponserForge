import os
import random
import django
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from core_engine.models import User, CreatorProfile, BrandProfile, Campaign
from core_engine.views import embedding_model

def seed_database():
    print("=== STARTING POPULATING RICH DATABASE SEED DATA ===")

    # List of 50 Creators across diverse Niches & Platforms
    creators_data = [
        # Tech & AI
        {"username": "tech_visionary_alex", "name": "Alex Tech Vision", "niche": "tech", "platform": "youtube", "subs": 450000, "eng": 4.8, "bio": "Reviewing cutting-edge AI software, developer tools, and gadgets."},
        {"username": "code_with_clara", "name": "Clara Codes", "niche": "tech", "platform": "youtube", "subs": 185000, "eng": 5.2, "bio": "Software architecture tutorials, web frameworks, and dev workflow hacks."},
        {"username": "gadget_guru_mark", "name": "Mark Gadgets", "niche": "tech", "platform": "instagram", "subs": 290000, "eng": 3.9, "bio": "Daily aesthetic desk setups, unboxings, and smartphone comparisons."},
        {"username": "cyber_sec_sarah", "name": "Sarah CyberSec", "niche": "tech", "platform": "tiktok", "subs": 320000, "eng": 6.1, "bio": "Bite-sized cybersecurity tips, privacy hacks, and VPN reviews."},
        {"username": "ai_insider_david", "name": "David AI Lab", "niche": "tech", "platform": "youtube", "subs": 520000, "eng": 4.4, "bio": "Deep dives into LLMs, AI agents, machine learning, and automation."},

        # Gaming & Esports
        {"username": "apex_slayer_vince", "name": "Vince Apex", "niche": "gaming", "platform": "twitch", "subs": 210000, "eng": 7.2, "bio": "Competitive FPS streamer, esports breakdown, and gaming hardware lover."},
        {"username": "cozy_gamer_mia", "name": "Mia Cozy Gaming", "niche": "gaming", "platform": "youtube", "subs": 380000, "eng": 5.8, "bio": "Chill indie games, cozy desk setups, and Nintendo Switch gameplay."},
        {"username": "rpg_legend_thor", "name": "Thor RPG Vault", "niche": "gaming", "platform": "youtube", "subs": 640000, "eng": 4.9, "bio": "Tactical RPG reviews, lore breakdowns, and walkthrough guides."},
        {"username": "pixel_queen_tara", "name": "Tara Pixel Arts", "niche": "gaming", "platform": "tiktok", "subs": 195000, "eng": 8.1, "bio": "Retro games, speedruns, and gaming news highlights."},
        {"username": "sim_racer_lewis", "name": "Lewis Sim Racing", "niche": "gaming", "platform": "youtube", "subs": 140000, "eng": 6.4, "bio": "High-end racing simulators, wheel reviews, and F1 gaming commentary."},

        # Fitness & Health
        {"username": "crossfit_jack", "name": "Jack CrossFit Pro", "niche": "fitness", "platform": "youtube", "subs": 410000, "eng": 5.6, "bio": "High-intensity workout routines, gym nutrition, and protein reviews."},
        {"username": "yoga_flow_chloe", "name": "Chloe Yoga", "niche": "fitness", "platform": "instagram", "subs": 610000, "eng": 4.2, "bio": "Daily mindfulness, mobility flows, and activewear styling."},
        {"username": "calisthenics_danny", "name": "Danny Bodyweight", "niche": "fitness", "platform": "tiktok", "subs": 530000, "eng": 7.8, "bio": "Street workout progressions, muscle-up guides, and home fitness."},
        {"username": "marathon_runner_leo", "name": "Leo Endurance", "niche": "fitness", "platform": "youtube", "subs": 125000, "eng": 6.0, "bio": "Marathon training vlogs, running shoe reviews, and electrolyte supplements."},
        {"username": "fit_nutrition_zoe", "name": "Zoe Nutritionist", "niche": "fitness", "platform": "instagram", "subs": 340000, "eng": 5.1, "bio": "Meal prep recipes, macro counting tips, and healthy lifestyle advice."},

        # Fashion & Beauty
        {"username": "streetwear_kai", "name": "Kai Street Fashion", "niche": "fashion", "platform": "instagram", "subs": 490000, "eng": 4.7, "bio": "Sneaker drops, vintage streetwear lookbooks, and fashion hauls."},
        {"username": "glam_by_sophia", "name": "Sophia Glam", "niche": "fashion", "platform": "youtube", "subs": 780000, "eng": 5.5, "bio": "Skincare routines, makeup transformations, and luxury fashion reviews."},
        {"username": "thrift_queen_amber", "name": "Amber Thrift & Style", "niche": "fashion", "platform": "tiktok", "subs": 670000, "eng": 8.4, "bio": "Sustainable thrifting, outfit flips, and minimalist wardrobe design."},
        {"username": "mens_style_julian", "name": "Julian Dapper", "niche": "fashion", "platform": "youtube", "subs": 310000, "eng": 4.3, "bio": "Grooming guides, tailored suits, and modern men's lifestyle."},
        {"username": "beauty_science_dr_ebony", "name": "Dr Ebony Skincare", "niche": "fashion", "platform": "instagram", "subs": 220000, "eng": 6.2, "bio": "Dermatologist-backed skincare ingredient reviews and sun protection tips."},

        # Finance & Investing
        {"username": "crypto_trader_max", "name": "Max Crypto Daily", "niche": "finance", "platform": "youtube", "subs": 890000, "eng": 5.1, "bio": "Bitcoin analysis, DeFi protocols, Web3 news, and trading market updates."},
        {"username": "wealth_coach_olivia", "name": "Olivia Financial Freedom", "niche": "finance", "platform": "youtube", "subs": 560000, "eng": 4.6, "bio": "Index fund investing, FIRE movement strategies, and real estate passive income."},
        {"username": "fintech_hacks_sam", "name": "Sam Money Hacks", "niche": "tiktok", "platform": "tiktok", "subs": 440000, "eng": 7.9, "bio": "Credit card rewards strategies, side hustles, and personal budgeting."},
        {"username": "stock_market_ethan", "name": "Ethan Dividend Growth", "niche": "finance", "platform": "youtube", "subs": 270000, "eng": 4.8, "bio": "Quarterly earnings breakdowns, dividend portfolios, and stock research."},
        {"username": "frugal_tech_investor", "name": "Rachel Frugal Tech", "niche": "finance", "platform": "instagram", "subs": 190000, "eng": 5.7, "bio": "Building tech wealth on a budget, early retirement plans, and money tips."},

        # Lifestyle & Travel
        {"username": "nomad_wanderer_luke", "name": "Luke World Nomad", "niche": "lifestyle", "platform": "youtube", "subs": 920000, "eng": 6.3, "bio": "Solo travel vlogs, digital nomad lifestyle, and hidden gems around the globe."},
        {"username": "minimalist_home_emma", "name": "Emma Minimalist Living", "niche": "lifestyle", "platform": "youtube", "subs": 430000, "eng": 5.0, "bio": "Decluttering, interior decor, slow living, and productive morning routines."},
        {"username": "van_life_ben", "name": "Ben Off-Grid Camper", "niche": "lifestyle", "platform": "youtube", "subs": 680000, "eng": 6.8, "bio": "Custom campervan tours, solar power builds, and cross-country adventures."},
        {"username": "tokyo_vlogs_kenji", "name": "Kenji Tokyo Life", "niche": "lifestyle", "platform": "instagram", "subs": 350000, "eng": 7.1, "bio": "Japan travel guides, street food tours, and Tokyo night photography."},
        {"username": "daily_vlogs_hannah", "name": "Hannah Everyday", "niche": "lifestyle", "platform": "tiktok", "subs": 810000, "eng": 8.0, "bio": "POV daily life, coffee shop reviews, study vlogs, and lifestyle aesthetic."},

        # Cooking & Food
        {"username": "chef_ramon_bites", "name": "Ramon Culinary", "niche": "lifestyle", "platform": "youtube", "subs": 720000, "eng": 5.4, "bio": "Gourmet home cooking, steak technique guides, and restaurant reviews."},
        {"username": "vegan_plate_maya", "name": "Maya Plant Cooking", "niche": "lifestyle", "platform": "instagram", "subs": 390000, "eng": 6.0, "bio": "15-minute plant-based dinners, high-protein vegan meals, and baking."},
        {"username": "baking_with_grace", "name": "Grace Pastry Lab", "niche": "lifestyle", "platform": "tiktok", "subs": 540000, "eng": 7.5, "bio": "Sourdough tutorials, aesthetic cakes, and dessert masterclasses."},

        # Automotive & Tech
        {"username": "ev_garage_nathan", "name": "Nathan EV Garage", "niche": "tech", "platform": "youtube", "subs": 330000, "eng": 4.9, "bio": "Electric vehicle tests, Tesla mods, charging network comparisons."},
        {"username": "supercar_spotter_tom", "name": "Tom Supercars", "niche": "lifestyle", "platform": "youtube", "subs": 1100000, "eng": 5.9, "bio": "Exotic car reviews, track days, and automotive engineering."},

        # Music & Audio
        {"username": "beatmaker_marcus", "name": "Marcus Producer", "niche": "tech", "platform": "youtube", "subs": 260000, "eng": 6.7, "bio": "Hip-hop beatmaking, studio monitor reviews, and Ableton tutorials."},
        {"username": "acoustic_vocal_lily", "name": "Lily Acoustic Covers", "niche": "lifestyle", "platform": "youtube", "subs": 480000, "eng": 7.3, "bio": "Singer-songwriter covers, mic reviews, and acoustic guitar sessions."},

        # Education & DIY
        {"username": "diy_woodwork_sam", "name": "Sam Woodworks", "niche": "tech", "platform": "youtube", "subs": 590000, "eng": 5.2, "bio": "Custom hardwood tables, power tool testing, and workshop DIY."},
        {"username": "3d_print_lab_alex", "name": "Alex 3D Printing", "niche": "tech", "platform": "youtube", "subs": 370000, "eng": 6.6, "bio": "3D printer reviews, CAD design tutorials, and custom props."},
        {"username": "photo_master_liam", "name": "Liam Shutter", "niche": "lifestyle", "platform": "youtube", "subs": 630000, "eng": 5.7, "bio": "Cinematic camera lens reviews, Lightroom presets, and drone videos."}
    ]

    print(f"\n[Seeding] Adding {len(creators_data)} Creators...")
    for item in creators_data:
        user, created = User.objects.get_or_create(
            username=item["username"],
            defaults={"email": f"{item['username']}@sponserforge.com", "role": "creator"}
        )
        if created:
            user.set_password("password123")
            user.save()

        profile, _ = CreatorProfile.objects.get_or_create(user=user)
        profile.name = item["name"]
        profile.niche = item["niche"]
        profile.primary_platform = item["platform"]
        profile.subscriber_count = item["subs"]
        profile.engagement_rate = item["eng"]
        profile.bio = item["bio"]
        profile.avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={item['username']}"
        profile.platform_link = f"https://{item['platform']}.com/@{item['username']}"
        profile.location = random.choice(["San Francisco, USA", "London, UK", "Berlin, Germany", "Toronto, Canada", "Sydney, Australia", "Tokyo, Japan", "Austin, USA", "Mumbai, India"])
        profile.social_links = {
            item["platform"]: f"https://{item['platform']}.com/@{item['username']}",
            "twitter": f"https://x.com/{item['username']}"
        }

        # Embed vector representation for AI match
        text_to_embed = f"{profile.niche}. {profile.bio}. Platform: {profile.primary_platform}"
        if hasattr(embedding_model, 'encode'):
            profile.embedding = embedding_model.encode(text_to_embed).tolist()

        profile.save()
        print(f"  [OK] Creator: @{profile.user.username} ({profile.niche.upper()} - {profile.subscriber_count:,} subs)")


    # List of 15 Brands across diverse Industries
    brands_data = [
        {"username": "quantum_ai_cloud", "name": "Quantum AI Cloud", "industry": "SaaS & AI Software", "size": "50-250", "audience": "Developers & AI Engineers", "website": "https://quantumai.cloud"},
        {"username": "hyper_gear_gaming", "name": "HyperGear Gaming", "industry": "Gaming Peripherals", "size": "250-500", "audience": "Gamers & Streamers", "website": "https://hypergear.gg"},
        {"username": "peak_nutrition_labs", "name": "Peak Nutrition Labs", "industry": "Fitness & Supplements", "size": "10-50", "audience": "Athletes & Fitness Enthusiasts", "website": "https://peaknutrition.fit"},
        {"username": "velox_footwear", "name": "Velox Athletic Wear", "industry": "Fashion & Apparel", "size": "50-250", "audience": "Runners & Streetwear Enthusiasts", "website": "https://veloxwear.com"},
        {"username": "crypto_vault_pay", "name": "CryptoVault Pay", "industry": "Financial Tech & Crypto", "size": "50-250", "audience": "Investors & Crypto Traders", "website": "https://cryptovault.io"},

        {"username": "lumina_display_co", "name": "Lumina Monitor Co", "industry": "Consumer Electronics", "size": "250-500", "audience": "Content Creators & Tech Enthusiasts", "website": "https://luminadisplay.com"},
        {"username": "brew_master_coffee", "name": "BrewMaster Roasters", "industry": "Food & Beverage", "size": "10-50", "audience": "Coffee Enthusiasts & Remote Workers", "website": "https://brewmaster.coffee"},
        {"username": "wander_world_travel", "name": "Wander World eSIM", "industry": "Travel & Hospitality", "size": "10-50", "audience": "Digital Nomads & Travelers", "website": "https://wanderesim.com"},
        {"username": "glow_botanicals", "name": "Glow Organics", "industry": "Beauty & Skincare", "size": "10-50", "audience": "Skincare & Beauty Audience", "website": "https://gloworganics.beauty"},
        {"username": "code_academy_pro", "name": "CodeAcademy Pro", "industry": "E-Learning & EdTech", "size": "50-250", "audience": "Students & Career Changers", "website": "https://codeacademypro.edu"},

        {"username": "titan_desk_ergonomics", "name": "Titan Ergo Desks", "industry": "Consumer Electronics", "size": "50-250", "audience": "Remote Workers & Gamers", "website": "https://titandergo.com"},
        {"username": "sound_wave_audio", "name": "SoundWave Studio Gear", "industry": "Consumer Electronics", "size": "10-50", "audience": "Podcasters, Musicians & Creators", "website": "https://soundwaveaudio.io"},
        {"username": "eco_clean_home", "name": "EcoClean Living", "industry": "Fashion & Apparel", "size": "10-50", "audience": "Eco-Conscious Families & Homemakers", "website": "https://ecoclean.green"},
        {"username": "zenith_crypto_wallet", "name": "Zenith Hardware Wallet", "industry": "Financial Tech & Crypto", "size": "50-250", "audience": "Web3 & Crypto Holders", "website": "https://zenithwallet.tech"},
        {"username": "pulse_energy_drink", "name": "Pulse Zero Energy", "industry": "Food & Beverage", "size": "250-500", "audience": "Esports Gamers & Gym Goers", "website": "https://pulsedrink.com"}
    ]

    print(f"\n[Seeding] Adding {len(brands_data)} Brands...")
    created_brands = []
    for b_item in brands_data:
        user, created = User.objects.get_or_create(
            username=b_item["username"],
            defaults={"email": f"{b_item['username']}@sponserforge.com", "role": "brand"}
        )
        if created:
            user.set_password("password123")
            user.save()

        b_profile, _ = BrandProfile.objects.get_or_create(user=user)
        b_profile.company_name = b_item["name"]
        b_profile.industry = b_item["industry"]
        b_profile.company_size = b_item["size"]
        b_profile.target_audience = b_item["audience"]
        b_profile.website = b_item["website"]
        b_profile.logo_url = f"https://api.dicebear.com/7.x/identicon/svg?seed={b_item['username']}"
        b_profile.points_balance = random.randint(5000, 20000)
        b_profile.bio = f"Official sponsor page for {b_item['name']}. Partnering with top creators."
        b_profile.save()
        created_brands.append(user)
        print(f"  [OK] Brand: @{b_profile.user.username} ({b_profile.company_name})")


    # List of 20 Campaigns from different Brands targeting various Creator niches
    campaigns_seed = [
        {
            "brand_index": 0, # Quantum AI Cloud
            "title": "Quantum AI Cloud SDK Launch & Code Review",
            "desc": "Demonstrate how Quantum AI Cloud accelerates developer workflows. Show an integration tutorial using our Python / JS SDK in your code video or livestreams.",
            "format": "YouTube Dedicated Video / Stream Segment",
            "points": 2500,
            "niche": "tech",
            "platform": "youtube",
            "min_subs": 25000,
            "creators": 3,
            "status": "active"
        },
        {
            "brand_index": 1, # HyperGear Gaming
            "title": "HyperGear Pro Wireless Headset Review",
            "desc": "Unbox and review the new 7.1 Surround Wireless Gaming Headset during your gameplay videos or Twitch live streams. Highlighting zero-latency audio and mic clarity.",
            "format": "YouTube Video / Twitch Stream Segment",
            "points": 1800,
            "niche": "gaming",
            "platform": "youtube",
            "min_subs": 50000,
            "creators": 4,
            "status": "active"
        },
        {
            "brand_index": 2, # Peak Nutrition Labs
            "title": "Peak Electrolyte & Hydration Powder Fitness Challenge",
            "desc": "Feature Peak Hydration Sticks in your pre/post-workout videos. Highlight zero-sugar ingredients and stamina endurance benefits in an aesthetic Instagram Reel or Shorts.",
            "format": "Instagram Reel / YouTube Shorts",
            "points": 1200,
            "niche": "fitness",
            "platform": "instagram",
            "min_subs": 15000,
            "creators": 5,
            "status": "active"
        },
        {
            "brand_index": 3, # Velox Athletic Wear
            "title": "Velox Carbon-Plate Marathon Running Shoe Review",
            "desc": "Test-run the new Carbon-Plate speed shoe on a 10k or marathon training vlog. Share honest feedback on cushioning, weight, and energy return.",
            "format": "YouTube Vlog / Instagram Post",
            "points": 2000,
            "niche": "fitness",
            "platform": "youtube",
            "min_subs": 20000,
            "creators": 2,
            "status": "active"
        },
        {
            "brand_index": 4, # CryptoVault Pay
            "title": "CryptoVault Web3 Wallet Security Guide",
            "desc": "Educate your crypto & finance audience on cold storage hardware safety and how CryptoVault protects assets against phishing hacks.",
            "format": "YouTube Dedicated Breakdown",
            "points": 3000,
            "niche": "finance",
            "platform": "youtube",
            "min_subs": 40000,
            "creators": 3,
            "status": "active"
        },

        {
            "brand_index": 5, # Lumina Monitor Co
            "title": "Lumina 32-inch 4K OLED Creator Monitor Setup",
            "desc": "Integrate Lumina 4K OLED monitor into your studio / desk setup video. Highlight color accuracy (99% DCI-P3) for video editing, coding, and gaming.",
            "format": "YouTube Studio Desk Setup / Reel",
            "points": 3500,
            "niche": "tech",
            "platform": "youtube",
            "min_subs": 75000,
            "creators": 2,
            "status": "active"
        },
        {
            "brand_index": 6, # BrewMaster Roasters
            "title": "BrewMaster Single-Origin Coffee Morning Routine",
            "desc": "Showcase your morning coffee brewing ritual featuring BrewMaster artisanal beans. Ideal for cozy lifestyle, study, and daily routine content creators.",
            "format": "TikTok / Instagram Reel",
            "points": 800,
            "niche": "lifestyle",
            "platform": "tiktok",
            "min_subs": 10000,
            "creators": 6,
            "status": "active"
        },
        {
            "brand_index": 7, # Wander World eSIM
            "title": "Wander World Global eSIM International Travel Review",
            "desc": "Share how Wander eSIM keeps digital nomads connected across 150+ countries without roaming fees. Show instant activation during your travel vlogs.",
            "format": "YouTube Travel Vlog / Instagram Story Set",
            "points": 1500,
            "niche": "lifestyle",
            "platform": "youtube",
            "min_subs": 20000,
            "creators": 4,
            "status": "active"
        },
        {
            "brand_index": 8, # Glow Organics
            "title": "Glow Vitamin C Hydration Serum 7-Day Challenge",
            "desc": "Document a 7-day skincare journey using Glow Vitamin C Serum. Show before/after glow results and natural organic ingredients in an aesthetic Reel.",
            "format": "Instagram Reel / TikTok",
            "points": 1100,
            "niche": "fashion",
            "platform": "instagram",
            "min_subs": 15000,
            "creators": 5,
            "status": "active"
        },
        {
            "brand_index": 9, # CodeAcademy Pro
            "title": "Full-Stack Web Dev Scholarship Sponsorship",
            "desc": "Promote CodeAcademy Pro's career bootcamp & free trial. Discuss how learning full-stack development or Python can double your income in 2026.",
            "format": "YouTube Dedicated Video Integration",
            "points": 2800,
            "niche": "tech",
            "platform": "youtube",
            "min_subs": 30000,
            "creators": 3,
            "status": "active"
        },

        {
            "brand_index": 10, # Titan Ergo Desks
            "title": "Titan Pro Standing Desk Unboxing & Motor Test",
            "desc": "Unbox and assemble the Titan Dual-Motor Electric Standing Desk. Showcase memory presets and cable management system in your workspace video.",
            "format": "YouTube Dedicated Review",
            "points": 4000,
            "niche": "tech",
            "platform": "youtube",
            "min_subs": 50000,
            "creators": 2,
            "status": "active"
        },
        {
            "brand_index": 11, # SoundWave Studio Gear
            "title": "SoundWave XLR Condenser Mic Podcasting Battle",
            "desc": "Test the SoundWave Broadcast Mic against industry standards. Show raw audio comparisons, noise cancellation, and vocal warmups.",
            "format": "YouTube Video / Podcast Segment",
            "points": 2200,
            "niche": "tech",
            "platform": "youtube",
            "min_subs": 20000,
            "creators": 3,
            "status": "active"
        },
        {
            "brand_index": 12, # EcoClean Living
            "title": "EcoClean Zero-Waste Laundry Detergent Sheets",
            "desc": "Demonstrate plastic-free laundry eco-sheets in your home routine or sustainable living tips. Focus on eco-friendly cleaning without chemical dyes.",
            "format": "TikTok / Instagram Reel",
            "points": 950,
            "niche": "lifestyle",
            "platform": "tiktok",
            "min_subs": 12000,
            "creators": 5,
            "status": "active"
        },
        {
            "brand_index": 13, # Zenith Hardware Wallet
            "title": "Zenith Touch-Screen Crypto Wallet Unboxing",
            "desc": "Showcase Zenith's biometric security hardware wallet. Walk viewers through seed phrase protection, mobile app pairing, and offline cold storage.",
            "format": "YouTube Review / X Video",
            "points": 3200,
            "niche": "finance",
            "platform": "youtube",
            "min_subs": 35000,
            "creators": 2,
            "status": "active"
        },
        {
            "brand_index": 14, # Pulse Zero Energy
            "title": "Pulse Energy Drink Gaming Tournament Sponsorship",
            "desc": "Drink Pulse Zero Energy live during your Twitch streams or YouTube gaming tournaments. Highlight 0 sugar, natural caffeine, and focus Nootropics.",
            "format": "Twitch Live Stream / YouTube Gaming Video",
            "points": 1600,
            "niche": "gaming",
            "platform": "twitch",
            "min_subs": 25000,
            "creators": 6,
            "status": "active"
        },

        # Scheduled Upcoming Campaigns
        {
            "brand_index": 0,
            "title": "Quantum AI Cloud Agent Framework v2.0 Global Launch",
            "desc": "Exclusive launch sponsorship for the new autonomous AI agent framework. Early access SDK demo for tech YouTubers.",
            "format": "YouTube Video",
            "points": 4500,
            "niche": "tech",
            "platform": "youtube",
            "min_subs": 50000,
            "creators": 3,
            "status": "scheduled"
        },
        {
            "brand_index": 1,
            "title": "HyperGear Ultra Lightweight 49g Gaming Mouse",
            "desc": "Pre-release review campaign for ultra-lightweight competitive esports mouse with 8000Hz polling rate.",
            "format": "YouTube / Twitch Stream",
            "points": 2100,
            "niche": "gaming",
            "platform": "youtube",
            "min_subs": 30000,
            "creators": 4,
            "status": "scheduled"
        },
        {
            "brand_index": 2,
            "title": "Peak Organic Vegan Protein Launch",
            "desc": "Sponsor workout videos with Peak's new organic pea & rice protein line.",
            "format": "Instagram Reel / Shorts",
            "points": 1400,
            "niche": "fitness",
            "platform": "instagram",
            "min_subs": 20000,
            "creators": 4,
            "status": "scheduled"
        },
        {
            "brand_index": 3,
            "title": "Velox Winter Outerwear & Puffer Jacket Collection",
            "desc": "Styling haul campaign for Velox thermal puffer jackets and waterproof winter gear.",
            "format": "Instagram Reel / TikTok",
            "points": 1900,
            "niche": "fashion",
            "platform": "instagram",
            "min_subs": 25000,
            "creators": 3,
            "status": "scheduled"
        },
        {
            "brand_index": 9,
            "title": "CodeAcademy AI Engineer Career Challenge 2026",
            "desc": "Sponsoring coding YouTubers and tech creators for the annual AI Engineering scholarship challenge.",
            "format": "YouTube Video",
            "points": 3100,
            "niche": "tech",
            "platform": "youtube",
            "min_subs": 40000,
            "creators": 3,
            "status": "scheduled"
        }
    ]

    print(f"\n[Seeding] Adding {len(campaigns_seed)} Campaigns...")
    for c_data in campaigns_seed:
        brand_user = created_brands[c_data["brand_index"]]
        
        start_time = timezone.now()
        if c_data["status"] == "scheduled":
            start_time = timezone.now() + timedelta(days=random.randint(1, 7))

        campaign, created = Campaign.objects.get_or_create(
            brand_user=brand_user,
            title=c_data["title"],
            defaults={
                "description": c_data["desc"],
                "deliverables_format": c_data["format"],
                "points_reward": c_data["points"],
                "target_niche": c_data["niche"],
                "target_platform": c_data["platform"],
                "min_subscribers_required": c_data["min_subs"],
                "creators_needed": c_data["creators"],
                "status": c_data["status"],
                "start_datetime": start_time,
                "duration_hours": 72
            }
        )

        # Auto-encode campaign embedding for vector matching
        text_to_embed = f"{campaign.title}. {campaign.description}. Niche: {campaign.target_niche}"
        if hasattr(embedding_model, 'encode'):
            campaign.embedding = embedding_model.encode(text_to_embed).tolist()
        campaign.save()

        print(f"  [OK] Campaign: '{campaign.title}' (Brand: @{brand_user.username}, Reward: {campaign.points_reward} pts)")

    print("\n=== SEEDING COMPLETED SUCCESSFULLY! ===")

if __name__ == '__main__':
    seed_database()
