from django import forms
from .models import TrainingJob
from .utils import get_available_dates

class TrainingJobForm(forms.ModelForm):
    data_period = forms.ChoiceField(choices=[(date, date) for date in get_available_dates()])

    class Meta:
        model = TrainingJob
        fields = ['data_period']
