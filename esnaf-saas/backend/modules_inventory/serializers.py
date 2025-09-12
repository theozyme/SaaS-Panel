# backend/modules_inventory/serializers.py
from rest_framework import serializers
from .models import InventoryItem

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = [
            "id", "name", "sku", "qty", "price", "low_stock_threshold",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
