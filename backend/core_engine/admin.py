from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CreatorProfile, BrandProfile, Campaign, CampaignApplication, PointsTransaction

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Attributes', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser')

admin.site.register(User, CustomUserAdmin)
admin.site.register(CreatorProfile)
admin.site.register(BrandProfile)
admin.site.register(Campaign)
admin.site.register(CampaignApplication)
admin.site.register(PointsTransaction)