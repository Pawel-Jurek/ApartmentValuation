from django.db import models

class ValuationModel(models.Model):
    data_period = models.DateField(unique=True)
    model_file_name = models.CharField(max_length=255, blank=True, null=True)
    correlation_file_name = models.CharField(max_length=255, blank=True, null=True)
    scaler_file_name = models.CharField(max_length=255, blank=True, null=True)
    columns_file_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('failed_import', 'Failed DB import'),
            ('failed_training', 'Failed model Training')
        ],
        default='pending'
    )

    def __str__(self):
        return f'Model {self.data_period} ({self.status})'