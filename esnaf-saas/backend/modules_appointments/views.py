# backend/modules_appointments/views.py
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from tenants.utils import get_current_tenant
from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = get_current_tenant(self.request)
        if not tenant:
            return Appointment.objects.none()
        return Appointment.objects.filter(tenant=tenant)

    def perform_create(self, serializer):
        tenant = get_current_tenant(self.request)
        if not tenant:
            raise ValidationError("Tenant bulunamadı.")
        serializer.save(tenant=tenant)
