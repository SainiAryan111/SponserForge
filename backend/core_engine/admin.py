from django.contrib import admin
from .models import  CreatorProfile, BrandProfile, CampaignBrief, Campaign

# Register your models here so they appear in the Admin UI
admin.site.register(CreatorProfile)
admin.site.register(CampaignBrief)
admin.site.register(BrandProfile)
admin.site.register(Campaign)