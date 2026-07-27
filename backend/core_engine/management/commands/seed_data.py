from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core_engine.models import CreatorProfile
from sentence_transformers import SentenceTransformer

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds dummy creators and generates vector embeddings using all-MiniLM-L6-v2."

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Loading embedding model..."))
        # Load the sentence-transformer model (produces 384-dim vectors)
        model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

        # Dummy creator dataset
        sample_creators = [
            {
                "username": "tech_reviewer_alex",
                "niche": "Tech & Gadgets",
                "platform": "youtube",
                "subscribers": 150000,
                "bio": "Unboxing the latest smartphones, GPUs, PC builds, and software reviews for tech enthusiasts."
            },
            {
                "username": "fitness_with_sarah",
                "niche": "Health & Fitness",
                "platform": "instagram",
                "subscribers": 85000,
                "bio": "Daily home workouts, high-protein recipes, gym gear recommendations, and wellness tips."
            },
            {
                "username": "code_with_dev",
                "niche": "Software Engineering",
                "platform": "youtube",
                "subscribers": 45000,
                "bio": "Tutorials on Python, Django, React, web development projects, and AI tooling for devs."
            }
        ]

        for item in sample_creators:
            # 1. Create or get user
            user, created = User.objects.get_or_create(
                username=item['username'],
                defaults={'email': f"{item['username']}@example.com"}
            )
            if created:
                user.set_password("password123")
                user.save()

            # 2. Convert creator text into a semantic vector
            text_to_embed = f"{item['niche']}. {item['bio']}"
            vector_embedding = model.encode(text_to_embed).tolist()

            # 3. Create or update profile with vector
            profile, _ = CreatorProfile.objects.update_or_create(
                user=user,
                defaults={
                    'niche': item['niche'],
                    'primary_platform': item['platform'],
                    'subscriber_count': item['subscribers'],
                    'bio': item['bio'],
                    'embedding': vector_embedding
                }
            )
            self.stdout.write(self.style.SUCCESS(f"Processed creator: {user.username}"))

        self.stdout.write(self.style.SUCCESS("Data seeding and vector embedding generation complete!"))