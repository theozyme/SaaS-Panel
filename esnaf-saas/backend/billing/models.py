# backend/billing/models.py
import uuid
from django.db import models
from tenants.models import Tenant

class Module(models.Model):
    TYPE_CHOICES = (("core", "Core"), ("addon", "Addon"))
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="core")

    def __str__(self):
        return f"{self.code} ({self.type})"

class Subscription(models.Model):
    STATUS_CHOICES = (
        ("trial", "Trial"),
        ("active", "Active"),
        ("past_due", "Past Due"),
        ("canceled", "Canceled"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    plan = models.CharField(max_length=50, default="standard")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    started_at = models.DateTimeField(auto_now_add=True)

class SubscriptionModule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="subscription_modules")
    module = models.ForeignKey(Module, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("subscription", "module")
