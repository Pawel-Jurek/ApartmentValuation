from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Apartment
from training.models import ValuationModel

# @receiver(post_save, sender=Apartment)
# def create_training_job(sender, instance, created, **kwargs):
#     if created:
#         if not ValuationModel.objects.filter(data_period=instance.update_date).exists():
#             ValuationModel.objects.create(
#                 data_period=instance.update_date.date(),
#                 start_time=None,  
#                 end_time=None
#             )
