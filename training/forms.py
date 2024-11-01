from django import forms
from .models import ValuationModel
from .utils import get_available_dates

class ValuationModelForm(forms.ModelForm):
    data_period = forms.ChoiceField(choices=[(date, date) for date in get_available_dates()])

    class Meta:
        model = ValuationModel
        fields = ['data_period']
