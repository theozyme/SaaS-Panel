from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from tenants.utils import get_current_tenant
from .models import Module, Subscription, SubscriptionModule
from rest_framework import status
from django.db import transaction


class ActiveModulesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = get_current_tenant(request)
        if not tenant:
            return Response({"detail": "Tenant bulunamadı."}, status=400)

        core = list(Module.objects.filter(type="core").values("code", "name", "type"))

        sub = Subscription.objects.filter(tenant=tenant, status="active").first()
        addons = []
        if sub:
            addon_ids = SubscriptionModule.objects.filter(subscription=sub).values_list("module_id", flat=True)
            addons = list(Module.objects.filter(id__in=addon_ids).values("code", "name", "type"))

        return Response({"modules": core + addons})
def get_or_create_active_subscription(tenant):
    sub, created = Subscription.objects.get_or_create(
        tenant=tenant,
        defaults={"status": "active"}
    )
    if sub.status != "active":
        sub.status = "active"
        sub.save(update_fields=["status"])
    return sub

class TenantProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = get_current_tenant(request)
        if not tenant:
            return Response({"detail": "Tenant bulunamadı."}, status=400)

        core = list(Module.objects.filter(type="core").values("code", "name", "type"))
        all_addons = list(Module.objects.filter(type="addon").values("code", "name", "type"))

        sub = Subscription.objects.filter(tenant=tenant, status="active").first()
        active_addon_codes = []
        if sub:
            active_ids = SubscriptionModule.objects.filter(subscription=sub).values_list("module_id", flat=True)
            active_addon_codes = list(Module.objects.filter(id__in=active_ids).values_list("code", flat=True))

        return Response({
            "tenant": {
                "id": str(tenant.id),
                "name": tenant.name,
                "created_at": tenant.created_at,
            },
            "core_modules": core,
            "available_addons": all_addons,
            "active_addons": active_addon_codes,
        })

class ModuleActivateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        tenant = get_current_tenant(request)
        if not tenant:
            return Response({"detail": "Tenant bulunamadı."}, status=400)

        code = (request.data or {}).get("code")
        if not code:
            return Response({"detail": "code gerekli."}, status=400)

        try:
            mod = Module.objects.get(code=code)
        except Module.DoesNotExist:
            return Response({"detail": "Modül bulunamadı."}, status=404)

        if mod.type != "addon":
            return Response({"detail": "Sadece addon modüller etkinleştirilebilir."}, status=400)

        sub = get_or_create_active_subscription(tenant)
        # idempotent
        SubscriptionModule.objects.get_or_create(subscription=sub, module=mod)

        # güncel listeyi döndür
        core = list(Module.objects.filter(type="core").values("code", "name", "type"))
        addon_ids = SubscriptionModule.objects.filter(subscription=sub).values_list("module_id", flat=True)
        addons = list(Module.objects.filter(id__in=addon_ids).values("code", "name", "type"))
        return Response({"modules": core + addons}, status=200)

class ModuleDeactivateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        tenant = get_current_tenant(request)
        if not tenant:
            return Response({"detail": "Tenant bulunamadı."}, status=400)

        code = (request.data or {}).get("code")
        if not code:
            return Response({"detail": "code gerekli."}, status=400)

        try:
            mod = Module.objects.get(code=code)
        except Module.DoesNotExist:
            return Response({"detail": "Modül bulunamadı."}, status=404)

        if mod.type != "addon":
            return Response({"detail": "Sadece addon modüller devre dışı bırakılabilir."}, status=400)

        sub = Subscription.objects.filter(tenant=tenant, status="active").first()
        if sub:
            SubscriptionModule.objects.filter(subscription=sub, module=mod).delete()

        core = list(Module.objects.filter(type="core").values("code", "name", "type"))
        addon_ids = []
        if sub:
            addon_ids = SubscriptionModule.objects.filter(subscription=sub).values_list("module_id", flat=True)
        addons = list(Module.objects.filter(id__in=addon_ids).values("code", "name", "type"))
        return Response({"modules": core + addons}, status=200)
