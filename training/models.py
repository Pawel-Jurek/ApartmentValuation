from django.db import models

class TrainingJob(models.Model):
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('failed', 'Failed')],
        default='pending'
    )
    data_period = models.DateField()
    output_model = models.FileField(upload_to='models/', null=True, blank=True)

    def __str__(self):
        return f"Training Job - {self.data_period} ({self.status})"
