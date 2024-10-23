from django.contrib import admin
from .models import TrainingJob
from .forms import TrainingJobForm
from django.utils import timezone
from .training_script import train_model

@admin.register(TrainingJob)
class TrainingJobAdmin(admin.ModelAdmin):
    form = TrainingJobForm
    list_display = ['data_period', 'status', 'start_time', 'end_time']
    actions = ['train_models']

    def train_models(self, request, queryset):
        for job in queryset:
            if job.status != 'in_progress':
                try:
                    job.status = 'in_progress'
                    job.start_time = timezone.now()
                    job.save()
                    train_model(job.data_period)
                    job.status = 'completed'
                    job.end_time = timezone.now()
                    job.save()
                except Exception as e:
                    job.status = "failed"
                    print(e)

    train_models.short_description = "Start model training"
