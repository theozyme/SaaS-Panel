from rest_framework.routers import DefaultRouter
from .views import JobViewSet

router = DefaultRouter()  # /jobs/ gibi yollar üretir
router.register(r"jobs", JobViewSet, basename="jobs")

urlpatterns = router.urls
