from .models import Tenant, TenantUser

def get_current_tenant(request):
    # 1) Header'dan (önerilen)
    tid = request.headers.get("X-Tenant-ID")
    if tid:
        try:
            return Tenant.objects.get(id=tid)
        except Tenant.DoesNotExist:
            return None
    # 2) Kullanıcının ilk tenant'ı
    if request.user and request.user.is_authenticated:
        tu = TenantUser.objects.filter(user=request.user).select_related("tenant").first()
        if tu:
            return tu.tenant
    return None
