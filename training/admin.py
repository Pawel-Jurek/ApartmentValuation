import datetime
from django.contrib import admin, messages

from training.update_db_script import import_apartments
from .models import ValuationModel
from .forms import ValuationModelForm
from django.utils import timezone
from .training_script import train_model
from django.shortcuts import render, redirect
from django.urls import path

@admin.register(ValuationModel)
class ValuationModelAdmin(admin.ModelAdmin):
    form = ValuationModelForm
    fields = ['model_file_name', 'correlation_file_name', 'scaler_file_name', 'columns_file_name']
    list_display = ['data_period', 'status', 'created_at', 'updated_at']
    actions = ['train_models']
    readonly_fields  = ['data_period', 'status', 'created_at', 'updated_at']

    def add_view(self, request, form_url='', extra_context=None):
        if request.method == "POST" and 'confirm' in request.POST:
            today_date = datetime.date.today()
            model, created = ValuationModel.objects.get_or_create(
                data_period=today_date,
            )
            
            if created:
                base_path = 'training_results'
                date_str = today_date.strftime('%Y-%m-%d')
                model.model_file_name = f'model{date_str}.keras'
                model.correlation_file_name = f'correlation{date_str}.json'
                model.scaler_file_name = f'scaler{date_str}.pkl'
                model.columns_file_name = f'columns{date_str}.json'
                model.save()

                msg = f"Your model has been created for period {today_date}."
            else:
                model.status = 'pending'
                model.start_time = timezone.now()
                model.save()
                msg = f"Model already exists for period {today_date}."
            
            messages.success(request, msg)

            status = import_apartments()

            if status[0] == 'success':
                messages.success(request, "Your database for this model has been updated")
                self.train_models(request, [model])
                if model.status == "completed":
                    messages.success(request, "Your model has been trained successfully")
                
            else:
                messages.error(request, f"An error occurred while updating database: {status[1]}")

            return redirect('admin:training_valuationmodel_changelist')

        
        context = extra_context or {}
        context['custom_message'] = "Are you sure you want to import new data to database, create and train model?" \
            if not ValuationModel.objects.filter(data_period=datetime.date.today()) \
            else "Are you sure you want to import new data to database, recreate and retrain model?"
        
        return render(request, 'admin/confirm_new_job.html', context)



    def train_models(self, request, queryset):
        for model in queryset:
            if model.status != 'in_progress' and model.status != 'failed_import':
                try:
                    model.status = 'in_progress'
                    model.save()
                    train_model(model.data_period, model.status)
                    model.status = 'completed'
                    model.updated = timezone.now()
                    model.save()
                except Exception as e:
                    model.status = "failed_training"
                    model.updated = timezone.now()
                    model.save()
                    messages.error(request, f"{e}")

            elif model.status == 'in_progress':
                messages.error(request, f"Wait until the process is finished")
            else:
                messages.error(request, f"Reimport data first by adding new object")

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
