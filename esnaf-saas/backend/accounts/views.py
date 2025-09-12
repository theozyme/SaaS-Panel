# backend/accounts/views.py
from rest_framework import generics, permissions, response, status
from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        result = ser.save()
        user = result["user"]
        tenant = result["tenant"]

        refresh = RefreshToken.for_user(user)
        return response.Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "tenant_id": str(tenant.id),
        }, status=status.HTTP_201_CREATED)
