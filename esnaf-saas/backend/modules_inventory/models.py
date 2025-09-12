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

class InventoryItem(BaseTenantModel):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=64, blank=True, default="")  # opsiyonel
    qty = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    low_stock_threshold = models.IntegerField(default=0)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} • {self.qty} adet • {self.price}₺"
