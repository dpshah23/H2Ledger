from django.urls import path
from .views import *

urlpatterns = [
    # Health check
    path("health/", health_check, name="health_check"),
    
    # Dashboard endpoints
    path("dashboard/analytics/", dashboard_analytics, name="dashboard_analytics"),
    path("dashboard/transactions/", dashboard_transactions, name="dashboard_transactions"),
    
    # Market data endpoints
    path("market/data/", market_data, name="market_data"),
    path("market/price/", market_data, name="market_price"),  # Alias for compatibility
    
    # Trading endpoints
    path("trading/orders/", trading_orders, name="trading_orders"),
    path("trading/burn/", burn_credits, name="burn_credits"),
    
    # Legacy dashboard endpoint (for backwards compatibility)
    path("dashboard/", dashboard_view, name="dashboard_view"),
    
    # Credit operations
    path("transfer/", transfer_credit, name="transfer_credit"),
    path("mint/", mint_credit, name="mint_credit"),
    path("use/", use_credit, name="use_credit"),
    
    # Batch operations
    path("batch/", verify_batch, name="verify_batch"),
    path("batch/create/", create_hydrogen_batch, name="create_hydrogen_batch"),
    path("batch/list/", list_hydrogen_batches, name="list_hydrogen_batches"),
    
    # Credits endpoints
    path("credits/", list_credits, name="list_credits"),
    path("credits/<int:credit_id>/", credit_detail, name="credit_detail"),

    # Leaderboard endpoint
    path("leaderboard/", hydrogen_leaderboard, name="hydrogen_leaderboard"),
]
