# backend/tenants/models.py
import uuid
from django.db import models
from django.contrib.auth.models import User

class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class TenantUser(models.Model):
    ROLE_CHOICES = (
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("staff", "Staff"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default="owner")

    class Meta:
        unique_together = ("tenant", "user")

    def __str__(self):
        return f"{self.user.username} @ {self.tenant.name} ({self.role})"
