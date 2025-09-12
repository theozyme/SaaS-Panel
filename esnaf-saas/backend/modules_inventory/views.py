# backend/modules_inventory/views.py
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from tenants.utils import get_current_tenant
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = get_current_tenant(self.request)
        if not tenant:
            return InventoryItem.objects.none()
        return InventoryItem.objects.filter(tenant=tenant).order_by("name")

    def perform_create(self, serializer):
        tenant = get_current_tenant(self.request)
        if not tenant:
            raise ValidationError("Tenant bulunamadı.")
        serializer.save(tenant=tenant)
