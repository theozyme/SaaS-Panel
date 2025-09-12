import uuid
from django.db import models
from django.utils import timezone
from tenants.models import Tenant

class BaseTenantModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Appointment(BaseTenantModel):
    STATUS_CHOICES = (
        ("pending", "Bekliyor"),
        ("confirmed", "Onaylandı"),
        ("done", "Tamamlandı"),
        ("canceled", "İptal"),
    )
    who = models.CharField(max_length=200)                         # müşteri adı
    when = models.DateTimeField(default=timezone.now)              # randevu tarihi
    category = models.CharField(max_length=100, default="Genel kontrol")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-when", "-created_at"]

    def __str__(self):
        return f"{self.who} • {self.category} • {self.when:%Y-%m-%d %H:%M}"
