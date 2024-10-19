from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [ 
    path('addresses/<str:city>/', views.addresses, name = "addresses"),
    path('', views.valuation, name = "valuation"),
]
