from django.urls import path
from .views import SummaryReportView

urlpatterns = [
    path("reports/summary", SummaryReportView.as_view(), name="reports-summary"),
]
