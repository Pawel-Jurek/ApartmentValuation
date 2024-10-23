import os
import pandas as pd
import json
import numpy as np
from django.conf import settings
from django.db import connection
from keras.callbacks import EarlyStopping, ModelCheckpoint
from keras.models import Model, load_model
from keras.layers import Input, Dense
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split


def create_data_file(data_period):
    csv_filename = f"apartments_{data_period}.csv"
    csv_filepath = os.path.join(settings.BASE_DIR, 'media', 'training_data', csv_filename)

    if not os.path.exists(csv_filepath):
        query = """
            SELECT 
                id, district, city, floor, price, rooms, sq, year, price_per_sq, update_date, offer_url
            FROM 
                public.valuation_apartment
            WHERE 
                update_date = %s
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [data_period])
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        df = pd.DataFrame(rows, columns=columns)

        os.makedirs(os.path.dirname(csv_filepath), exist_ok=True)

        df.to_csv(csv_filepath, index=False)
    
    return csv_filepath


def remove_outliers(df):
    df_out = pd.DataFrame()
    for key, subdf in df.groupby('city'):
        m = np.mean(subdf.price_per_sq)
        st = np.std(subdf.price_per_sq)
        reduced_df = subdf[(subdf.price_per_sq>(m-st)) & (subdf.price_per_sq <= (m+st))]
        df_out = pd.concat([df_out, reduced_df], ignore_index = True)
    return df_out


def add_weighted_features(X, correlation, X_columns):
        weights = np.array([correlation.get(col, 1) for col in X_columns])
        weighted_features = X * weights
        return np.concatenate((X, weighted_features), axis=1)


def train_model(data_period):
    
    data = pd.read_csv(create_data_file(data_period), encoding = "utf-8")
    data = remove_outliers(data)

    dummies = pd.get_dummies(data.city)
    prepared_df = pd.concat([data,dummies],axis='columns')
    dummies = pd.get_dummies(data.district)
    prepared_df = pd.concat([prepared_df,dummies],axis='columns')


    data_to_corr = prepared_df.drop(["district", "update_date", "city", "offer_url", "price_per_sq"], axis='columns')
    X = prepared_df.drop(['price', "district", "update_date", "city", "offer_url", "price_per_sq"], axis='columns')
    X_columns = X.columns
    y = prepared_df.price
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=10)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    correlation = data_to_corr.corr()['price'].abs()

    X_train_extended = add_weighted_features(X_train_scaled, correlation, X_train.columns)
    X_test_extended = add_weighted_features(X_test_scaled, correlation, X_train.columns)

    print("Rozpoczęcie treningu")

    input_layer = Input(shape=(X_train_extended.shape[1],))
    dense1 = Dense(128, activation='relu')(input_layer)
    dense2 = Dense(64, activation='relu')(dense1)
    dense3 = Dense(32, activation='relu')(dense2)

    output_lower = Dense(1, name='lower_output')(dense3)
    output_upper = Dense(1, name='upper_output')(dense3)

    weighted_model = Model(inputs=input_layer, outputs=[output_lower, output_upper])
    weighted_model.compile(optimizer='nadam', loss='mean_squared_error', metrics=['mse', 'mae'])

    early_stopping = EarlyStopping(
        monitor='val_loss', 
        patience=10, 
        restore_best_weights=True
    )

    best_model_path = f"training/ai_models/model{data_period}.keras"

    model_checkpoint = ModelCheckpoint(
        best_model_path, 
        monitor='val_loss', 
        save_best_only=True, 
        save_weights_only=False
    )

    margin = 0.1 * y_train
    y_train_lower = y_train - margin
    y_train_upper = y_train + margin

    margin_test = 0.1 * y_test
    y_test_lower = y_test - margin_test
    y_test_upper = y_test + margin_test

    history = weighted_model.fit(
        X_train_extended, 
        [y_train_lower, y_train_upper],
        epochs=100, 
        batch_size=32, 
        validation_split=0.2,
        callbacks=[early_stopping, model_checkpoint]
    )

    best_weighted_model = load_model(best_model_path)

    evaluation_results = best_weighted_model.evaluate(
        X_test_extended, [y_test_lower, y_test_upper]
    )

    y_pred_lower, y_pred_upper = best_weighted_model.predict(X_test_extended)

    r2_lower = r2_score(y_test_lower, y_pred_lower)
    r2_upper = r2_score(y_test_upper, y_pred_upper)

    print(f"R² dla dolnych granic (best_weighted_model): {r2_lower}")
    print(f"R² dla górnych granic (best_weighted_model): {r2_upper}")

    columns = {
        'data_columns': [col.lower() for col in X_columns]
    }
    
    with open('training/ai_models/columns.json', 'w') as f:
        f.write(json.dumps(columns))
