from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [ 
    path('addresses/<str:city>/', views.addresses, name = "addresses"),
    path('get-home-data/', views.get_home_data),
    path('', views.valuation, name = "valuation"),
]
