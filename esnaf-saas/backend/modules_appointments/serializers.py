# backend/modules_appointments/serializers.py
from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "who", "when", "category", "status", "note", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
