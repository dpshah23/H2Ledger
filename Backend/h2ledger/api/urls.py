from django.urls import path
from .views import *
urlpatterns = [
    path("transfer/", transfer_credit, name="transfer_credit"),
    path("mint/", mint_credit, name="mint_credit"),
]
