import os
import numpy as np
import json
import pickle
import random
import sys
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

def get_estimated_price(city, district, floor, rooms, sq, year, prediction_year, prediction_quartal):

    try:
        district_index = data_columns.index(district.lower())
        city_index = data_columns.index(city.lower())
    except:
        district_index = -1
        city_index = -1
    
    try:
        x = np.zeros(len(data_columns))
        x[0] = floor
        x[1] = rooms
        x[2] = sq
        x[3] = year

        if district_index >= 0 and city_index >= 0:
            x[district_index] = 1
            x[city_index] = 1
            x = x.reshape(1, -1)
            
            # for fork model
            preds = model_tf.predict(x)
            lower_pred = float(np.round(preds[0][0], 2))
            upper_pred = float(np.round(preds[1][0], 2))
            return lower_pred, upper_pred, round(random.uniform(-100.00, 100.00), 2)
        else:
            return 0
        
    except ValueError as e:
        return 0

    

def load_artifacts():
    global data_columns
    global model_tf

    modeling_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'modeling')
    
    columns_path = os.path.join(modeling_dir, 'columns.json')
    with open(columns_path, 'r') as file:
        data_columns = json.load(file)['data_columns']

    model_tf_path = os.path.join(modeling_dir, 'house_prices_fork_ann_model.pickle')
    with open(model_tf_path, 'rb') as file:
        model_tf = pickle.load(file)


# load_artifacts()