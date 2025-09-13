# backend/billing/urls.py
from django.urls import path
from .views import ActiveModulesView, TenantProfileView, ModuleActivateView, ModuleDeactivateView

urlpatterns = [
    path("modules/active", ActiveModulesView.as_view(), name="modules-active"),
    path("tenant/profile", TenantProfileView.as_view(), name="tenant-profile"),
    path("modules/activate", ModuleActivateView.as_view(), name="modules-activate"),
    path("modules/deactivate", ModuleDeactivateView.as_view(), name="modules-deactivate"),
]
