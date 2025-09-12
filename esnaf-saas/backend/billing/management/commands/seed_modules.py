# backend/billing/management/commands/seed_modules.py
from django.core.management.base import BaseCommand
from billing.models import Module

CORE = [
    ("dashboard", "Dashboard"),
    ("jobs", "İş Emirleri"),
    ("payments", "Ödemeler"),
    ("settings", "Ayarlar"),
]
ADDONS = [
    ("appointments", "Randevular"),
    ("inventory", "Stok Yönetimi"),
    ("reports", "Raporlar"),
]

class Command(BaseCommand):
    help = "Seed core/addon modules"

    def handle(self, *args, **options):
        for code, name in CORE:
            Module.objects.update_or_create(code=code, defaults={"name": name, "type": "core"})
        for code, name in ADDONS:
            Module.objects.update_or_create(code=code, defaults={"name": name, "type": "addon"})
        self.stdout.write(self.style.SUCCESS("Modules seeded/updated"))
