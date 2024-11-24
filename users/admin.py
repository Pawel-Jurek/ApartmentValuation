from django.contrib import admin
from .models import ApartmentSearch
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(ApartmentSearch)
class ApartmentSearchAdmin(admin.ModelAdmin):
    list_display = ('id','search_date', 'user', 'city', 'district', 'floor', 'rooms', 'square_meters', 'year', 'suggested_price_min', 'suggested_price_max')
    search_fields = ('user__username', 'city', 'district')
    list_filter = ('city', 'district', 'search_date')



@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    pass