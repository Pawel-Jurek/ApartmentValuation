from django.urls import path
from .views import ApartmentSearchDetailView, ApartmentSearchListCreateView, \
    UserCreateView, UserDetailView, LogoutView, CustomTokenObtainPairView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='user_register'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('searches/', ApartmentSearchListCreateView.as_view(), name='apartmentsearch_list_create'),
    path('searches/<int:pk>/', ApartmentSearchDetailView.as_view(), name='apartmentsearch_detail'),
    path('<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
