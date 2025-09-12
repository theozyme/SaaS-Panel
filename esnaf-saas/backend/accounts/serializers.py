# backend/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from tenants.models import Tenant, TenantUser
from billing.models import Module, Subscription, SubscriptionModule

class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    biz_name = serializers.CharField()
    addons = serializers.ListField(child=serializers.CharField(), required=False)

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Bu e-posta ile kullanıcı mevcut.")
        return value

    def create(self, validated_data):
        full_name = validated_data["full_name"]
        email = validated_data["email"]
        password = validated_data["password"]
        biz_name = validated_data["biz_name"]
        addons = validated_data.get("addons", [])

        # 1) User
        user = User(username=email, email=email, first_name=full_name)
        user.set_password(password)
        user.save()

        # 2) Tenant + TenantUser
        tenant = Tenant.objects.create(name=biz_name)
        TenantUser.objects.create(tenant=tenant, user=user, role="owner")

        # 3) Subscription (standard)
        sub = Subscription.objects.create(tenant=tenant, plan="standard", status="active")

        # 4) Addons (varsa)
        for code in addons:
            try:
                m = Module.objects.get(code=code)
                SubscriptionModule.objects.get_or_create(subscription=sub, module=m)
            except Module.DoesNotExist:
                continue

        return {"user": user, "tenant": tenant, "subscription": sub}
