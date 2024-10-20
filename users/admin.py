from django.contrib import admin
from .models import User #, ApartmentSearch


# class ApartmentSearchAdmin(admin.ModelAdmin):
#     list_display = ('user', 'city', 'district', 'floor', 'rooms', 'square_meters', 'year', 'suggested_price_min', 'suggested_price_max', 'search_date')
#     search_fields = ('user__username', 'city', 'district')
#     list_filter = ('city', 'district', 'search_date')


# admin.site.register(ApartmentSearch, ApartmentSearchAdmin)
admin.site.register(User)