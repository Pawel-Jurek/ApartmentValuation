# Generated by Django 5.1.2 on 2024-11-28 16:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0004_remove_valuationmodel_columns_file_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='valuationmodel',
            old_name='columns_file_path',
            new_name='columns_file_name',
        ),
        migrations.RenameField(
            model_name='valuationmodel',
            old_name='correlation_file_path',
            new_name='correlation_file_name',
        ),
        migrations.RenameField(
            model_name='valuationmodel',
            old_name='model_file_path',
            new_name='model_file_name',
        ),
        migrations.RenameField(
            model_name='valuationmodel',
            old_name='scaler_file_path',
            new_name='scaler_file_name',
        ),
    ]
