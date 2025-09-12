from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from tenants.utils import get_current_tenant
from .models import Module, Subscription, SubscriptionModule

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
