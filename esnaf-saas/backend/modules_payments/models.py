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

class Payment(BaseTenantModel):
    METHOD_CHOICES = (
        ("cash", "Nakit"),
        ("card", "Kart"),
        ("transfer", "EFT/Havale"),
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default="cash")
    when = models.DateTimeField(default=timezone.now)
    note = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.amount}₺ • {self.get_method_display()} • {self.when:%Y-%m-%d %H:%M}"
