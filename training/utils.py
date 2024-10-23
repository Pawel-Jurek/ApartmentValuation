from django.db import connection

def get_available_dates():
    with connection.cursor() as cursor:
        cursor.execute("SELECT DISTINCT update_date FROM public.valuation_apartment;")
        dates = cursor.fetchall()
    return [date[0] for date in dates]
