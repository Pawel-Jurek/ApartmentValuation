from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.conf import settings

class User(AbstractUser):
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='custom_user_permissions',
    )


class ApartmentSearch(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    floor = models.IntegerField()
    rooms = models.IntegerField()
    square_meters = models.FloatField()
    year = models.IntegerField()
    suggested_price_min = models.FloatField()
    suggested_price_max = models.FloatField()
    search_date = models.DateTimeField(auto_now_add=True)

    PREDICTION_QUARTAL_CHOICES = [
        (1, 'Q1'),
        (2, 'Q2'),
        (3, 'Q3'),
        (4, 'Q4'),
    ]

    prediction_year = models.IntegerField(default=2024)
    prediction_quartal = models.IntegerField(choices=PREDICTION_QUARTAL_CHOICES, default=3)


    def __str__(self):
        return f"Search by {self.user} on {self.search_date}"