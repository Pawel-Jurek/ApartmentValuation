import os
import pandas as pd
from django.conf import settings
from django.db import connection

def train_model(data_period):
    csv_filename = f"apartments_{data_period}.csv"
    csv_filepath = os.path.join(settings.BASE_DIR, 'media', 'training_data', csv_filename)

    if os.path.exists(csv_filepath):
        print(f"Plik {csv_filename} już istnieje. Pomijanie tworzenia nowego pliku.")


    else:
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
        print(f"Plik {csv_filename} został utworzony i zapisany w {csv_filepath}.")
