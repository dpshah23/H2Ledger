"""
Dashboard service for H2Ledger
Provides comprehensive analytics and data aggregation for dashboard
"""

from django.db.models import Sum, Count, Q, Avg, Max, Min
from django.utils.timezone import now, timedelta
from datetime import datetime, date
from decimal import Decimal
import json

from .models import *
from .blockchain_service import BlockchainService


class DashboardService:
    """
    Service class for dashboard data aggregation and analytics
    """
    
    def __init__(self):
        self.blockchain_service = BlockchainService()
    
    def get_comprehensive_analytics(self, user):
        """
        Get comprehensive dashboard analytics for a user
        """
        try:
            analytics = {
                'user_analytics': self._get_user_analytics(user),
                'market_analytics': self._get_market_analytics(),
                'emissions_analytics': self._get_emissions_analytics(user),
                'trading_analytics': self._get_trading_analytics(user),
                'blockchain_sync': self._sync_blockchain_data(user)
            }
            
            return self._format_dashboard_response(analytics)
            
        except Exception as e:
            print(f"Error getting dashboard analytics: {e}")
            return self._get_default_analytics()
    
    def _get_user_analytics(self, user):
        """Get user-specific analytics"""
        # Total credits owned
        total_credits = Credit.objects.filter(
            owner=user, 
            status="active"
        ).aggregate(total=Sum("amount"))["total"] or 0
        
        # User's batches
        user_batches = HydrogenBatch.objects.filter(producer=user).count()
        
        # User's transaction count
        user_transactions = Transaction.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        ).count()
        
        return {
            'total_credits_owned': float(total_credits),
            'batches_produced': user_batches,
            'total_transactions': user_transactions
        }
    
    def _get_market_analytics(self):
        """Get market analytics"""
        # Current market price
        latest_price = MarketPrice.objects.first()
        current_price = float(latest_price.price_per_credit) if latest_price else 50.0
        
        # 24h trading volume
        yesterday = now() - timedelta(days=1)
        volume_24h = Transaction.objects.filter(
            timestamp__gte=yesterday,
            tx_type__in=['transfer', 'purchase'],
            fiat_value_usd__isnull=False
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Price trend (last 7 days)
        trend = self._calculate_price_trend()
        
        # Calculate 24h change
        change_24h = self._calculate_24h_change(trend, current_price)
        
        return {
            'current_price': current_price,
            'volume_24h': float(volume_24h),
            'change_24h': change_24h,
            'trend': trend
        }
    
    def _get_emissions_analytics(self, user):
        """Get emissions offset analytics"""
        # Total emissions offset
        total_emissions = EmissionsData.objects.filter(user=user).aggregate(
            total=Sum('co2_offset_kg')
        )['total'] or 0
        
        # Monthly emissions offset
        month_start = now().date().replace(day=1)
        monthly_emissions = EmissionsData.objects.filter(
            user=user,
            timestamp__date__gte=month_start
        ).aggregate(total=Sum('co2_offset_kg'))['total'] or 0
        
        # Monthly target (could be user-configurable)
        monthly_target = 1000  # kg CO2
        
        return {
            'total': float(total_emissions),
            'monthly_progress': float(monthly_emissions),
            'target': monthly_target
        }
    
    def _get_trading_analytics(self, user):
        """Get trading analytics"""
        today = now().date()
        week_start = today - timedelta(days=7)
        
        # Credits traded today
        credits_today = Transaction.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            tx_type__in=["transfer", "purchase"],
            timestamp__date=today
        ).aggregate(total=Sum("amount"))["total"] or 0
        
        # Credits traded this week
        credits_week = Transaction.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            tx_type__in=["transfer", "purchase"],
            timestamp__date__gte=week_start
        ).aggregate(total=Sum("amount"))["total"] or 0
        
        # Active trading orders
        active_orders = TradingOrder.objects.filter(
            user=user,
            status__in=['pending', 'partial']
        ).count()
        
        return {
            'today': float(credits_today),
            'this_week': float(credits_week),
            'active_orders': active_orders
        }
    
    def _sync_blockchain_data(self, user):
        """Sync relevant blockchain data"""
        try:
            # Sync market price from blockchain
            blockchain_price = self.blockchain_service.sync_market_price()
            
            # Get user's blockchain balance (if address available)
            blockchain_balance = 0
            if hasattr(user, 'blockchain_address') and user.blockchain_address:
                blockchain_balance = self.blockchain_service.get_blockchain_balance(
                    user.blockchain_address
                )
            
            return {
                'blockchain_price': blockchain_price,
                'blockchain_balance': blockchain_balance,
                'sync_timestamp': now().isoformat()
            }
        except Exception as e:
            print(f"Error syncing blockchain data: {e}")
            return {
                'blockchain_price': 50.0,
                'blockchain_balance': 0,
                'sync_timestamp': now().isoformat(),
                'error': str(e)
            }
    
    def _calculate_price_trend(self):
        """Calculate 7-day price trend"""
        trend = []
        today = now().date()
        
        for i in range(6, -1, -1):
            trend_date = today - timedelta(days=i)
            day_start = datetime.combine(trend_date, datetime.min.time())
            day_end = datetime.combine(trend_date, datetime.max.time())
            
            # Get average price for that day
            day_transactions = Transaction.objects.filter(
                timestamp__range=[day_start, day_end],
                tx_type__in=['transfer', 'purchase'],
                fiat_value_usd__isnull=False,
                amount__gt=0
            )
            
            if day_transactions.exists():
                day_prices = []
                for tx in day_transactions:
                    if tx.amount and tx.fiat_value_usd:
                        price = float(tx.fiat_value_usd) / float(tx.amount)
                        day_prices.append(price)
                day_avg = sum(day_prices) / len(day_prices) if day_prices else 50.0
            else:
                day_avg = 50.0  # Default price
            
            trend.append({
                'date': trend_date.strftime('%Y-%m-%d'),
                'price': round(day_avg, 2)
            })
        
        return trend
    
    def _calculate_24h_change(self, trend, current_price):
        """Calculate 24h price change percentage"""
        if len(trend) >= 2:
            yesterday_price = trend[-2]['price']
            change_24h = ((current_price - yesterday_price) / yesterday_price * 100) if yesterday_price > 0 else 0
            return round(change_24h, 2)
        return 0
    
    def _format_dashboard_response(self, analytics):
        """Format analytics into dashboard response format"""
        return {
            "totalCreditsOwned": analytics['user_analytics']['total_credits_owned'],
            "creditsTraded": {
                "today": analytics['trading_analytics']['today'],
                "thisWeek": analytics['trading_analytics']['this_week']
            },
            "marketPrice": {
                "current": analytics['market_analytics']['current_price'],
                "change24h": analytics['market_analytics']['change_24h'],
                "trend": analytics['market_analytics']['trend']
            },
            "emissionsOffset": {
                "total": analytics['emissions_analytics']['total'],
                "thisMonth": analytics['emissions_analytics']['monthly_progress'],
                "target": analytics['emissions_analytics']['target']
            },
            "additional_metrics": {
                "batches_produced": analytics['user_analytics']['batches_produced'],
                "total_transactions": analytics['user_analytics']['total_transactions'],
                "active_orders": analytics['trading_analytics']['active_orders'],
                "blockchain_sync": analytics['blockchain_sync']
            }
        }
    
    def _get_default_analytics(self):
        """Return default analytics in case of error"""
        return {
            "totalCreditsOwned": 0,
            "creditsTraded": {"today": 0, "thisWeek": 0},
            "marketPrice": {"current": 50.0, "change24h": 0, "trend": []},
            "emissionsOffset": {"total": 0, "thisMonth": 0, "target": 1000},
            "additional_metrics": {
                "batches_produced": 0,
                "total_transactions": 0,
                "active_orders": 0,
                "blockchain_sync": {"error": "Failed to load analytics"}
            }
        }
    
    def create_sample_data(self, user):
        """Create sample data for testing dashboard"""
        try:
            # Create sample market price
            MarketPrice.objects.get_or_create(
                defaults={'price_per_credit': Decimal('52.50'), 'volume_24h': Decimal('1250.5')}
            )
            
            # Create sample emissions data
            EmissionsData.objects.get_or_create(
                user=user,
                defaults={
                    'credits_burned': Decimal('10.5'),
                    'co2_offset_kg': Decimal('105.0')
                }
            )
            
            return True
        except Exception as e:
            print(f"Error creating sample data: {e}")
            return False


# Global dashboard service instance
dashboard_service = DashboardService()
