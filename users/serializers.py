from rest_framework import serializers
from .models import ApartmentSearch
from django.contrib.auth import get_user_model
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'valuation_tokens', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': True},
            'email': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "The passwords do not match."})

        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})

        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})

        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
    

class ApartmentSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentSearch
        fields = [
            'id', 'user', 'city', 'district', 'floor', 'rooms', 'square_meters',
            'year', 'suggested_price_min', 'suggested_price_max', 'search_date',
            'prediction_year', 'prediction_quartal'
        ]
        read_only_fields = ('user', 'search_date')

class CreateApartmentSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentSearch
        exclude = ('user', 'search_date')
