from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth (JWT)
    path("api/auth/login", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/", include("accounts.urls")),

    # Billing / Modules
    path("api/", include("billing.urls")),

    # Jobs
    path("api/", include("modules_jobs.urls")),

    # Payments  
    path("api/", include("modules_payments.urls")),

    # Appointments
    path("api/", include("modules_appointments.urls")),
    # Inventory
    path("api/", include("modules_inventory.urls")),
    # Reports
    path("api/", include("modules_reports.urls")),


]
