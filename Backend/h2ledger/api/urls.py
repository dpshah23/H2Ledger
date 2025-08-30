from django.urls import path
from .views import *
urlpatterns = [
    path("transfer/", transfer_credit, name="transfer_credit"),
    path("mint/", mint_credit, name="mint_credit"),
    path("batch/", verify_batch, name="verify_batch"),
    path("use/", use_credit, name="use_credit"),
    path("dashboard/", dashboard_view, name="dashboard_view"),
]
