from rest_framework import generics, permissions
from .models import User, ApartmentSearch
from .serializers import UserSerializer, ApartmentSearchSerializer, CreateApartmentSearchSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        try:
            user = User.objects.get(username=request.data['username'])
            response.data['user_id'] = user.id 
        except User.DoesNotExist:
            pass
        return response

class ApartmentSearchListCreateView(generics.ListCreateAPIView):
    serializer_class = ApartmentSearchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ApartmentSearch.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ApartmentSearchDetailView(generics.RetrieveAPIView):
    serializer_class = ApartmentSearchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ApartmentSearch.objects.filter(user=self.request.user)