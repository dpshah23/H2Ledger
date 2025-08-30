from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(HydrogenBatch)
admin.site.register(Credit)
admin.site.register(Transaction)
admin.site.register(Payment)