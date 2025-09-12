import uuid
from django.db import models
from tenants.models import Tenant

class BaseTenantModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Job(BaseTenantModel):
    STATUS_CHOICES = (
        ("open", "Açık"),
        ("in_progress", "Devam"),
        ("done", "Tamam"),
        ("canceled", "İptal"),
    )
    customer_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")

    def __str__(self):
        return f"{self.customer_name} • {self.status} • {self.total}₺"
