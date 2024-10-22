from django.contrib import admin
from .models import TrainingJob
from .forms import TrainingJobForm
from django.utils import timezone

@admin.register(TrainingJob)
class TrainingJobAdmin(admin.ModelAdmin):
    form = TrainingJobForm
    list_display = ['data_period', 'status', 'start_time', 'end_time']
    actions = ['start_training']

    def start_training(self, request, queryset):
        for job in queryset:
            if job.status == 'pending':
                job.status = 'in_progress'
                job.start_time = timezone.now()
                job.save()
                train_model(job.data_period)
                job.status = 'completed'
                job.end_time = timezone.now()
                job.save()

    start_training.short_description = "Start model training"
