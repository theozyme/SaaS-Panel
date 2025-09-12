# backend/modules_payments/views.py
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from tenants.utils import get_current_tenant
from .models import Payment
from .serializers import PaymentSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = get_current_tenant(self.request)
        if not tenant:
            return Payment.objects.none()
        return Payment.objects.filter(tenant=tenant).order_by("-when", "-created_at")

    def perform_create(self, serializer):
        tenant = get_current_tenant(self.request)
        if not tenant:
            raise ValidationError("Tenant bulunamadı.")
        serializer.save(tenant=tenant)
