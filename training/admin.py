import datetime
from django.contrib import admin, messages

from training.update_db_script import import_apartments
from .models import TrainingJob
from .forms import TrainingJobForm
from django.utils import timezone
from .training_script import train_model
from django.shortcuts import render, redirect
from django.urls import path

@admin.register(TrainingJob)
class TrainingJobAdmin(admin.ModelAdmin):
    form = TrainingJobForm
    list_display = ['data_period', 'status', 'start_time', 'end_time']
    actions = ['train_models']
    readonly_fields  = ['data_period', 'status', 'start_time', 'end_time']

    def add_view(self, request, form_url='', extra_context=None):
        if request.method == "POST" and 'confirm' in request.POST:
            today_date = datetime.date.today()
            job, created = TrainingJob.objects.get_or_create(
                data_period=today_date,
            )
            
            if created:
                msg = f"New training job created for period {today_date}."
            else:
                job.status = 'pending'
                job.start_time = timezone.now()
                job.save()
                msg = f"Training job already exists for period {today_date}."
            
            messages.success(request, msg)

            status = import_apartments()

            if status[0] == 'success':
                messages.success(request, "Apartment database has been successfully updated.")
            else:
                messages.error(request, f"An error occurred while updating the database: {status[1]}")

            return redirect('admin:training_trainingjob_changelist')

        
        context = extra_context or {}
        context['custom_message'] = "Are you sure you want to add today's data to the housing database and create new Training Job?" \
            if not TrainingJob.objects.filter(data_period=datetime.date.today()) \
            else "Are you sure you want to update today's data in the housing database and update Training Job?"
        
        return render(request, 'admin/confirm_new_job.html', context)



    def train_models(self, request, queryset):
        for job in queryset:
            if job.status != 'in_progress':
                try:
                    job.status = 'in_progress'
                    job.start_time = timezone.now()
                    job.save()
                    train_model(job.data_period, job.status)
                    job.status = 'completed'
                    job.end_time = timezone.now()
                    job.save()
                except Exception as e:
                    job.status = "failed"
                    job.save()
                    print(e)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'confirm-new-job/',
                self.admin_site.admin_view(self.add_view),
                name='confirm_new_job',
            ),
        ]
        return custom_urls + urls

    train_models.short_description = "Start model training"
