from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from users.models import ApartmentSearch
from .util import get_estimated_price, get_addresses
from django.views.decorators.csrf import csrf_exempt
import json

def index(request):
    return render(request, 'index.html')

def addresses(request, city):
    if request.method == 'GET':
         return JsonResponse({'addresses': get_addresses(city)}, status=200)
    else:
        return JsonResponse({'error': 'Wrong request method'}, status=405)

# chwilowe wyłączenie tokenu do testów
@csrf_exempt
@api_view(['POST'])
def valuation(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=403)
        
    data = json.loads(request.body)
    if data:
        district = data.get("district")
        sq = data.get("sq")
        city = data.get("city")
        floor = data.get("floor")
        rooms = data.get("rooms")
        year = data.get("year")
        prediction_year = data.get("prediction_year")
        prediction_quartal = data.get("prediction_year")

    # Przykładowe dane do testowania
    else:
        sq = 74.05
        district = 'Podgórze'
        city = 'Kraków'
        floor = 2.0
        rooms = 3.0
        year = 2021.0
        prediction_year= 2025
        prediction_quartal = 1



    


    if sq and district and city and floor != None and rooms and year and prediction_quartal and prediction_year:
        lower_price, upper_price, percent = get_estimated_price(city, district, floor, rooms, sq, year, prediction_year, prediction_quartal)

        search = ApartmentSearch.objects.create(
            user=request.user,
            city=city,
            district=district,
            floor=floor,
            rooms=rooms,
            square_meters=sq,
            year=year,
            suggested_price_min=lower_price,
            suggested_price_max=upper_price,
            prediction_year=prediction_year,
            prediction_quartal=prediction_quartal
        )

        return JsonResponse({'price': {'lower': lower_price, 'upper': upper_price, }, 'percent': percent}, status=200)
    else:
        return JsonResponse({'error': 'Missing data'}, status=400)
        