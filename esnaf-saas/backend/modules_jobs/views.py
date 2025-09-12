from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from tenants.utils import get_current_tenant
from .models import Job
from .serializers import JobSerializer

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = get_current_tenant(self.request)
        if not tenant:
            return Job.objects.none()
        return Job.objects.filter(tenant=tenant).order_by("-created_at")

    def perform_create(self, serializer):
        tenant = get_current_tenant(self.request)
        if not tenant:
            raise ValidationError("Tenant bulunamadı.")
        serializer.save(tenant=tenant)
