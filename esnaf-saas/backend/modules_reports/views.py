from django.db.models import Sum, Count, F

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from tenants.utils import get_current_tenant
from modules_jobs.models import Job
from modules_payments.models import Payment
from modules_inventory.models import InventoryItem

class SummaryReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = get_current_tenant(request)
        if not tenant:
            return Response({"detail": "Tenant bulunamadı."}, status=400)

        # Jobs
        jobs_qs = Job.objects.filter(tenant=tenant)
        jobs_total = jobs_qs.count()
        jobs_by_status = jobs_qs.values("status").annotate(count=Count("id"))

        # Payments
        payments_qs = Payment.objects.filter(tenant=tenant)
        payments_sum = payments_qs.aggregate(total=Sum("amount"))["total"] or 0

        # Inventory - low stock
        low_stock = list(
            InventoryItem.objects.filter(
        tenant=tenant,
        low_stock_threshold__gt=0,
        qty__lte=F("low_stock_threshold"),
    )
    .values("id", "name", "sku", "qty", "low_stock_threshold")[:25]
        )

        data = {
            "jobs": {
                "total": jobs_total,
                "by_status": {row["status"]: row["count"] for row in jobs_by_status},
            },
            "payments": {
                "total_amount": str(payments_sum),
            },
            "inventory": {
                "low_stock_count": len(low_stock),
                "low_stock_samples": low_stock,  # ilk 25
            },
        }
        return Response(data)
