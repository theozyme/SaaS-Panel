from django.urls import path
from .views import ActiveModulesView

urlpatterns = [
    path("modules/active", ActiveModulesView.as_view(), name="modules-active"),
]
