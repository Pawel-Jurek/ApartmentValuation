from datetime import datetime
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from users.models import ApartmentSearch, User
from .utils  import get_addresses, predict_actual_price, predict_future_price
from django.views.decorators.csrf import csrf_exempt
import json

def index(request):
    return render(request, 'index.html')

def addresses(request, city):
    if request.method == 'GET':
         return JsonResponse({'addresses': get_addresses(city)}, status=200)
    else:
        return JsonResponse({'error': 'Wrong request method'}, status=405)


@api_view(['GET'])
def get_home_data(request):
    data = {
            'valuations_count': ApartmentSearch.objects.all().count(),
            'users_count': User.objects.all().count(),
        }
    return JsonResponse(data=data)


# chwilowe wyłączenie tokenu do testów
@csrf_exempt
@api_view(['POST'])
def valuation(request):
    # if not request.user.is_authenticated:
    #     return JsonResponse({'error': 'Authentication required'}, status=403)
        
    data = json.loads(request.body)
    if data:
        district = data.get("district").lower()
        sq = data.get("sq")
        city = data.get("city").lower()
        floor = data.get("floor")
        rooms = data.get("rooms")
        year = data.get("year")
        prediction_year = data.get("prediction_year")
        prediction_month = data.get("prediction_month")

    # Przykładowe dane do testowania
    else:
        sq = 74.05
        district = 'podgórze'
        city = 'kraków'
        floor = 2.0
        rooms = 3.0
        year = 2021.0
        prediction_year= 2025
        prediction_month = 1

    if sq and district and city and floor != None and rooms and year and prediction_month and prediction_year:
        percent = 0
        if prediction_year == datetime.now().year and prediction_month == datetime.now().month:
             lower_price, upper_price = predict_actual_price(city, district, floor, rooms, sq, year) 
        else:
            lower_price, upper_price, percent = predict_future_price(city, district, floor, rooms, sq, year, prediction_year, prediction_month) 

        # search = ApartmentSearch.objects.create(
        #     user=request.user,
        #     city=city,
        #     district=district,
        #     floor=floor,
        #     rooms=rooms,
        #     square_meters=sq,
        #     year=year,
        #     suggested_price_min=lower_price,
        #     suggested_price_max=upper_price,
        #     prediction_year=prediction_year,
        #     prediction_month=prediction_month
        # )

        return JsonResponse({'price': {'lower': lower_price, 'upper': upper_price}, 'percent': percent}, status=200)
    else:
        return JsonResponse({'error': 'Missing data'}, status=400)
        