from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "username",
        "full_name",
        "phone_number",
        "is_doctor",
        "is_staff",
        "is_active",
    )
    list_filter = ("is_doctor", "is_staff", "is_active")
    search_fields = ("username", "first_name", "last_name", "phone_number")
    ordering = ("username",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Clinic role", {"fields": ("phone_number", "is_doctor")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Clinic role", {"classes": ("wide",), "fields": ("phone_number", "is_doctor")}),
    )

    def full_name(self, obj):
        full_name = obj.get_full_name().strip()
        return full_name or "-"

    full_name.short_description = "Full name"
