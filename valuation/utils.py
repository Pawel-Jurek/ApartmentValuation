from math import ceil
import os
import numpy as np
import json
import pickle
import random
import sys
from datetime import datetime
import pandas as pd
from tensorflow.keras.models import load_model
from django.utils import timezone

from training.models import ValuationModel


sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')


neighborhoods = {
    "Kraków": [
        'Stare Miasto', 
        'Grzegórzki', 
        'Prądnik Czerwony', 
        'Prądnik Biały', 
        'Krowodrza', 
        'Bronowice', 
        'Zwierzyniec', 
        'Dębniki', 
        'Łagiewniki-Borek Fałęcki',
        'Swoszowice', 
        'Podgórze Duchackie', 
        'Bieżanów-Prokocim', 
        'Podgórze', 
        'Czyżyny', 
        'Mistrzejowice', 
        'Bieńczyce', 
        'Wzgórza Krzesławickie', 
        'Nowa Huta'
        ],

    "Warszawa":[
        'Bemowo', 
        'Białołęka', 
        'Bielany', 
        'Mokotów', 
        'Ochota', 
        'Praga-Południe', 
        'Praga-Północ', 
        'Rembertów', 
        'Śródmieście', 
        'Targówek', 
        'Ursus', 
        'Ursynów', 
        'Wawer', 
        'Wesoła', 
        'Wilanów', 
        'Włochy', 
        'Wola', 
        'Żoliborz'

], "Poznań":[
        'Stare Miasto',
        'Nowe Miasto',
        'Wilda',
        'Grunwald',
        'Jeżyce'
]}


data_columns = None
model_tf = None # tensorflow model

def get_addresses(city):
    return neighborhoods[city.capitalize()]


def predict_future_price(city, district, floor, rooms, sq, year, looking_year, looking_month):
    
    today = datetime.today()
    today_year, today_month = today.year, today.month

    predictions = {}
    training_dates = []

    # Przechowywanie przewidywań dla każdego modelu (rok, miesiąc)
    for model in ValuationModel.objects.all():
        date = (model.data_period.year, model.data_period.month)
        training_dates.append(date)
        lower_pred, upper_pred = predict_actual_price(city, district, floor, rooms, sq, year, model)
        predictions[date] = (lower_pred, upper_pred)
    
    # Sortowanie dat
    sorted_dates = sorted(training_dates, key=lambda x: (x[0], x[1]))

    # Obliczanie zmian procentowych między kolejnymi miesiącami
    total_change_lower = 0
    total_change_upper = 0
    total_years = 0

    for i in range(1, len(sorted_dates)):
        prev_year, prev_month = sorted_dates[i - 1]
        current_year, current_month = sorted_dates[i]
        
        prev_lower, prev_upper = predictions[(prev_year, prev_month)]
        current_lower, current_upper = predictions[(current_year, current_month)]
        
        # Obliczenie zmian procentowych dla dolnej i górnej prognozy
        change_lower = (current_lower - prev_lower) / prev_lower
        change_upper = (current_upper - prev_upper) / prev_upper
        
        # Czas między okresami
        year_diff = (current_year - prev_year) + (current_month - prev_month) / 12.0
        
        # Sumowanie zmian, uwzględniając rok
        total_change_lower += change_lower / year_diff
        total_change_upper += change_upper / year_diff
        total_years += 1 / year_diff

    # Średnia zmiana roczna
    if total_years > 0:
        annual_change_rate_lower = total_change_lower / total_years
        annual_change_rate_upper = total_change_upper / total_years
        average_annual_change_rate = (annual_change_rate_lower + annual_change_rate_upper) / 2
    else:
        average_annual_change_rate = 0
    
    # Różnica czasu do docelowej daty
    looking_year_diff = (looking_year - today_year) + (looking_month - today_month) / 12.0
    
    # Obliczenie przyszłej ceny na podstawie bieżącej prognozy i uśrednionej zmiany rocznej
    current_lower, current_upper = predictions[(today_year, today_month)]
    future_lower_price = current_lower * (1 + average_annual_change_rate * looking_year_diff)
    future_upper_price = current_upper * (1 + average_annual_change_rate * looking_year_diff)

    # Procentowa zmiana uśredniona względem bieżącego okresu
    current_average_price = (current_lower + current_upper) / 2
    future_average_price = (future_lower_price + future_upper_price) / 2
    change_percentage_average = (future_average_price - current_average_price) / current_average_price * 100
    
    return (future_lower_price, future_upper_price), change_percentage_average


def get_addresses(city):
    return neighborhoods[city.capitalize()]


def predict_actual_price(city, district, floor, rooms, sq, year, own_model = None):
    if own_model:
        val_model = own_model
    else:
        today = timezone.now().date()
        val_model = ValuationModel.objects.filter(data_period__lte=today).order_by('-data_period').first()
    with open(val_model.columns_file_path, 'r') as f:
        X_columns = json.load(f)['data_columns']

    model = load_model(val_model.model_file_path)

    with open(val_model.scaler_file_path, 'rb') as f:
        scaler = pickle.load(f)

    with open(val_model.correlation_file_path, 'rb') as f:
        correlation = pickle.load(f)

    # Przygotowanie wektora cech
    x = np.zeros(len(X_columns))

    # Sprawdzenie istnienia kolumn przed przypisaniem wartości
    if 'floor' in X_columns:
        floor_idx = np.where(X_columns == 'floor')[0]
        if len(floor_idx) > 0:
            x[floor_idx[0]] = floor

    if 'rooms' in X_columns:
        rooms_idx = np.where(X_columns == 'rooms')[0]
        if len(rooms_idx) > 0:
            x[rooms_idx[0]] = rooms

    if 'sq' in X_columns:
        sq_idx = np.where(X_columns == 'sq')[0]
        if len(sq_idx) > 0:
            x[sq_idx[0]] = sq

    if 'year' in X_columns:
        year_idx = np.where(X_columns == 'year')[0]
        if len(year_idx) > 0:
            x[year_idx[0]] = year

    # Obsługa miasta i dzielnicy
    if city in X_columns:
        city_index = np.where(X_columns == city)[0]
        if len(city_index) > 0:
            x[city_index[0]] = 1

    if district in X_columns:
        district_index = np.where(X_columns == district)[0]
        if len(district_index) > 0:
            x[district_index[0]] = 1

    # Utworzenie DataFrame z wektora cech
    x_df = pd.DataFrame([x], columns=X_columns)
    
    x_scaled = scaler.transform(x_df)
    
    weights = np.array([correlation.get(col, 1) for col in X_columns])
    weighted_features = x_scaled * weights
    x_extended = np.concatenate((x_scaled, weighted_features), axis=1)

    preds = model.predict(x_extended)
    lower_pred = float(np.round(preds[0][0], 2))
    upper_pred = float(np.round(preds[1][0], 2))

    return lower_pred, upper_pred