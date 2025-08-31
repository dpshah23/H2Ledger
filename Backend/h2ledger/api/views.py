from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Sum, Count, Q, Avg, Max, Min
from django.utils.timezone import now, timedelta
from datetime import datetime, date
import hashlib
import time
import json
from decimal import Decimal

from .models import *
from .serializers import *
from auth1.models import User1


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """API health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': now().isoformat(),
        'version': '1.0.0'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def market_data(request):
    """
    Get current market data including price, volume, and trends
    """
    try:
        # Get latest market price
        latest_price = MarketPrice.objects.first()
        
        if not latest_price:
            # Create default market price if none exists
            latest_price = MarketPrice.objects.create(
                price_per_credit=Decimal('50.00'),
                volume_24h=Decimal('0')
            )
        
        # Get 24h volume from transactions
        yesterday = now() - timedelta(days=1)
        volume_24h = Transaction.objects.filter(
            timestamp__gte=yesterday,
            tx_type__in=['transfer', 'purchase'],
            fiat_value_usd__isnull=False
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Get price trend for last 7 days
        trend_data = []
        for i in range(6, -1, -1):
            trend_date = now().date() - timedelta(days=i)
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
                day_avg = sum(day_prices) / len(day_prices) if day_prices else float(latest_price.price_per_credit)
            else:
                day_avg = float(latest_price.price_per_credit)
            
            trend_data.append({
                'date': trend_date.strftime('%Y-%m-%d'),
                'price': round(day_avg, 2)
            })
        
        # Calculate 24h change
        if len(trend_data) >= 2:
            current_price = trend_data[-1]['price']
            yesterday_price = trend_data[-2]['price']
            change_24h = ((current_price - yesterday_price) / yesterday_price * 100) if yesterday_price > 0 else 0
        else:
            change_24h = 0
        
        return Response({
            'current_price': float(latest_price.price_per_credit),
            'volume_24h': float(volume_24h),
            'change_24h': round(change_24h, 2),
            'trend': trend_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def trading_orders(request):
    """
    GET: List user's trading orders
    POST: Create new trading order
    """
    user = request.user if hasattr(request, 'user') else None
    
    if request.method == 'GET':
        try:
            orders = TradingOrder.objects.filter(user=user).order_by('-created_at')
            serializer = TradingOrderSerializer(orders, many=True)
            return Response({'orders': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            data = request.data.copy()
            data['user'] = user.id
            
            serializer = TradingOrderSerializer(data=data)
            if serializer.is_valid():
                order = serializer.save()
                
                # Try to match with existing orders
                if order.order_type == 'buy':
                    matching_orders = TradingOrder.objects.filter(
                        order_type='sell',
                        price_per_credit__lte=order.price_per_credit,
                        status='pending'
                    ).order_by('price_per_credit', 'created_at')
                else:
                    matching_orders = TradingOrder.objects.filter(
                        order_type='buy',
                        price_per_credit__gte=order.price_per_credit,
                        status='pending'
                    ).order_by('-price_per_credit', 'created_at')
                
                # Simple order matching logic
                for match in matching_orders:
                    if order.quantity <= order.filled_quantity:
                        break
                    
                    available_quantity = match.quantity - match.filled_quantity
                    trade_quantity = min(order.quantity - order.filled_quantity, available_quantity)
                    
                    if trade_quantity > 0:
                        # Execute trade
                        trade_price = match.price_per_credit
                        
                        # Update order fill quantities
                        order.filled_quantity += trade_quantity
                        match.filled_quantity += trade_quantity
                        
                        # Update order statuses
                        if order.filled_quantity >= order.quantity:
                            order.status = 'completed'
                        else:
                            order.status = 'partial'
                        
                        if match.filled_quantity >= match.quantity:
                            match.status = 'completed'
                        else:
                            match.status = 'partial'
                        
                        order.save()
                        match.save()
                        
                        # Create transaction record
                        if order.order_type == 'buy':
                            buyer = order.user
                            seller = match.user
                        else:
                            buyer = match.user
                            seller = order.user
                        
                        # This would need credit transfer logic
                        # For now, just create a transaction record
                        Transaction.objects.create(
                            credit_id=1,  # This should be the actual credit being traded
                            from_user=seller,
                            to_user=buyer,
                            tx_type='transfer',
                            amount=trade_quantity,
                            fiat_value_usd=trade_quantity * trade_price,
                            tx_hash=f"trade_{int(time.time())}_{order.id}_{match.id}"
                        )
                
                return Response({
                    'order': TradingOrderSerializer(order).data,
                    'message': 'Order created successfully'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def burn_credits(request):
    """
    Burn credits for emissions offset
    """
    try:
        user = request.user if hasattr(request, 'user') else None
        credit_ids = request.data.get('credit_ids', [])
        
        if not credit_ids:
            return Response({'error': 'No credits specified'}, status=status.HTTP_400_BAD_REQUEST)
        
        total_burned = 0
        for credit_id in credit_ids:
            try:
                credit = Credit.objects.get(credit_id=credit_id, owner=user, status='active')
                
                # Mark credit as burned
                credit.status = 'burned'
                credit.save()
                
                # Create burn transaction
                tx_hash = f"burn_{int(time.time())}_{credit_id}"
                Transaction.objects.create(
                    credit=credit,
                    from_user=user,
                    tx_type='burn',
                    amount=credit.amount,
                    tx_hash=tx_hash
                )
                
                total_burned += float(credit.amount)
                
            except Credit.DoesNotExist:
                continue
        
        if total_burned > 0:
            # Calculate CO2 offset (1 credit = 10 kg CO2 offset)
            co2_offset = total_burned * 10
            
            # Record emissions data
            EmissionsData.objects.create(
                user=user,
                credits_burned=Decimal(str(total_burned)),
                co2_offset_kg=Decimal(str(co2_offset))
            )
            
            return Response({
                'credits_burned': total_burned,
                'co2_offset_kg': co2_offset,
                'message': f'Successfully burned {total_burned} credits, offsetting {co2_offset} kg CO2'
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No valid credits found to burn'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """
    Enhanced dashboard analytics with comprehensive data using new service
    """
    try:
        from .dashboard_service import dashboard_service
        
        user = request.user if hasattr(request, 'user') else None
        
        # Use the comprehensive dashboard service
        analytics = dashboard_service.get_comprehensive_analytics(user)
        
        return Response(analytics, status=status.HTTP_200_OK)

    except Exception as e:
        # Fallback to original implementation
        return _fallback_dashboard_analytics(request)


def _fallback_dashboard_analytics(request):
    """
    Fallback dashboard analytics implementation
    """
    try:
        user = request.user if hasattr(request, 'user') else None
        
        # Get user's total credits
        total_credits = Credit.objects.filter(
            owner=user, 
            status="active"
        ).aggregate(total=Sum("amount"))["total"] or 0

        # Calculate trading stats
        today = now().date()
        week_start = today - timedelta(days=7)
        
        credits_traded_today = Transaction.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            tx_type__in=["transfer", "purchase"],
            timestamp__date=today
        ).aggregate(total=Sum("amount"))["total"] or 0

        credits_traded_week = Transaction.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            tx_type__in=["transfer", "purchase"],
            timestamp__date__gte=week_start
        ).aggregate(total=Sum("amount"))["total"] or 0

        # Market price calculation
        recent_transactions = Transaction.objects.filter(
            tx_type__in=["transfer", "purchase"],
            fiat_value_usd__isnull=False,
            amount__gt=0
        ).order_by("-timestamp")[:50]

        if recent_transactions.exists():
            prices = []
            for tx in recent_transactions:
                if tx.amount and tx.fiat_value_usd:
                    price_per_credit = float(tx.fiat_value_usd) / float(tx.amount)
                    prices.append(price_per_credit)
            
            current_price = sum(prices) / len(prices) if prices else 50.0
            
            # Calculate 24h change (simplified)
            yesterday_prices = []
            yesterday = today - timedelta(days=1)
            yesterday_tx = Transaction.objects.filter(
                tx_type__in=["transfer", "purchase"],
                timestamp__date=yesterday,
                fiat_value_usd__isnull=False,
                amount__gt=0
            )
            
            for tx in yesterday_tx:
                if tx.amount and tx.fiat_value_usd:
                    price = float(tx.fiat_value_usd) / float(tx.amount)
                    yesterday_prices.append(price)
            
            yesterday_avg = sum(yesterday_prices) / len(yesterday_prices) if yesterday_prices else current_price
            change_24h = ((current_price - yesterday_avg) / yesterday_avg * 100) if yesterday_avg > 0 else 0
        else:
            current_price = 50.0  # Default price
            change_24h = 0

        # Emissions offset calculation
        emissions_offset_total = Transaction.objects.filter(
            from_user=user,
            tx_type="burn"
        ).aggregate(total=Sum("amount"))["total"] or 0

        # Convert credits to emissions offset (assuming 1 credit = 10 kg CO2 offset)
        emissions_kg = float(emissions_offset_total) * 10 if emissions_offset_total else 0
        
        # Monthly progress
        month_start = today.replace(day=1)
        monthly_offset = Transaction.objects.filter(
            from_user=user,
            tx_type="burn",
            timestamp__date__gte=month_start
        ).aggregate(total=Sum("amount"))["total"] or 0
        
        monthly_offset_kg = float(monthly_offset) * 10 if monthly_offset else 0
        monthly_target = 1000  # 1000 kg CO2 offset per month target
        
        # Market price trend (last 7 days)
        trend = []
        for i in range(6, -1, -1):
            trend_date = today - timedelta(days=i)
            day_transactions = Transaction.objects.filter(
                tx_type__in=["transfer", "purchase"],
                timestamp__date=trend_date,
                fiat_value_usd__isnull=False,
                amount__gt=0
            )
            
            if day_transactions.exists():
                day_prices = []
                for tx in day_transactions:
                    if tx.amount and tx.fiat_value_usd:
                        price = float(tx.fiat_value_usd) / float(tx.amount)
                        day_prices.append(price)
                day_avg = sum(day_prices) / len(day_prices) if day_prices else current_price
            else:
                day_avg = current_price
            
            trend.append({
                "date": trend_date.strftime("%Y-%m-%d"),
                "price": round(day_avg, 2)
            })

        return Response({
            "totalCreditsOwned": float(total_credits),
            "creditsTraded": {
                "today": float(credits_traded_today),
                "thisWeek": float(credits_traded_week)
            },
            "marketPrice": {
                "current": round(current_price, 2),
                "change24h": round(change_24h, 2),
                "trend": trend
            },
            "emissionsOffset": {
                "total": round(emissions_kg, 2),
                "thisMonth": round(monthly_offset_kg, 2),
                "target": monthly_target
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "error": str(e),
            "totalCreditsOwned": 0,
            "creditsTraded": {"today": 0, "thisWeek": 0},
            "marketPrice": {"current": 50.0, "change24h": 0, "trend": []},
            "emissionsOffset": {"total": 0, "thisMonth": 0, "target": 1000}
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def dashboard_transactions(request):
    """
    Get recent transactions for dashboard
    """
    try:
        user = request.user if hasattr(request, 'user') else None
        limit = int(request.GET.get('limit', 10))
        
        # Get user's recent transactions
        transactions = Transaction.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        ).order_by('-timestamp')[:limit]
        
        transaction_data = []
        for tx in transactions:
            # Determine transaction type from user perspective
            if tx.from_user == user:
                tx_type = 'sell' if tx.tx_type == 'transfer' else tx.tx_type
                counterparty = tx.to_user.name if tx.to_user else 'System'
            else:
                tx_type = 'buy' if tx.tx_type == 'transfer' else tx.tx_type
                counterparty = tx.from_user.name if tx.from_user else 'System'
            
            transaction_data.append({
                'id': str(tx.tx_id),
                'type': tx_type,
                'creditId': str(tx.credit.credit_id),
                'quantity': float(tx.amount),
                'price': float(tx.fiat_value_usd) if tx.fiat_value_usd else 0,
                'counterparty': counterparty,
                'timestamp': tx.timestamp.isoformat(),
                'status': 'completed'  # Assuming all DB transactions are completed
            })
        
        return Response(transaction_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_credits(request):
    """
    List user's credits with filtering and pagination
    """
    try:
        user = request.user if hasattr(request, 'user') else None
        
        # Get query parameters
        status_filter = request.GET.get('status', 'active')
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Filter credits
        credits_query = Credit.objects.filter(owner=user)
        if status_filter != 'all':
            credits_query = credits_query.filter(status=status_filter)
        
        # Get total count
        total_count = credits_query.count()
        
        # Get paginated results
        credits = credits_query.order_by('-created_at')[offset:offset + limit]
        
        # Serialize data
        credits_data = []
        for credit in credits:
            credits_data.append({
                'id': credit.credit_id,
                'batchId': credit.batch.batch_id,
                'amount': float(credit.amount),
                'status': credit.status,
                'txHash': credit.tx_hash,
                'createdAt': credit.created_at.isoformat(),
                'batch': {
                    'producer': credit.batch.producer.name,
                    'productionDate': credit.batch.production_date.isoformat(),
                    'quantityKg': float(credit.batch.quantity_kg)
                }
            })
        
        return Response({
            'credits': credits_data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def credit_detail(request, credit_id):
    """
    Get detailed information about a specific credit
    """
    try:
        user = request.user if hasattr(request, 'user') else None
        
        credit = Credit.objects.get(credit_id=credit_id, owner=user)
        
        # Get transaction history for this credit
        transactions = Transaction.objects.filter(credit=credit).order_by('-timestamp')
        
        transaction_history = []
        for tx in transactions:
            transaction_history.append({
                'id': tx.tx_id,
                'type': tx.tx_type,
                'amount': float(tx.amount),
                'fromUser': tx.from_user.name if tx.from_user else None,
                'toUser': tx.to_user.name if tx.to_user else None,
                'fiatValue': float(tx.fiat_value_usd) if tx.fiat_value_usd else None,
                'txHash': tx.tx_hash,
                'timestamp': tx.timestamp.isoformat()
            })
        
        credit_data = {
            'id': credit.credit_id,
            'batchId': credit.batch.batch_id,
            'amount': float(credit.amount),
            'status': credit.status,
            'txHash': credit.tx_hash,
            'createdAt': credit.created_at.isoformat(),
            'batch': {
                'id': credit.batch.batch_id,
                'producer': credit.batch.producer.name,
                'producerEmail': credit.batch.producer.email,
                'quantityKg': float(credit.batch.quantity_kg),
                'productionDate': credit.batch.production_date.isoformat(),
                'certification': credit.batch.certification,
                'isApproved': credit.batch.is_approved,
                'createdAt': credit.batch.created_at.isoformat()
            },
            'transactions': transaction_history
        }
        
        return Response(credit_data, status=status.HTTP_200_OK)
        
    except Credit.DoesNotExist:
        return Response({"error": "Credit not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_hydrogen_batch(request):

    try:
        serializer = HydrogenBatchSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": True, "batch": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_hydrogen_batches(request):

    try:
        batches = HydrogenBatch.objects.all().order_by("-created_at")
        serializer = HydrogenBatchSerializer(batches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def mint_credit(request):

    try:
        data = request.data
        batch_id = data.get("batch_id")
        owner_id = data.get("owner_id")
        amount = data.get("amount")

        batch = HydrogenBatch.objects.get(batch_id=batch_id)
        if not batch.is_approved:
            return Response({"error": "Batch not approved for minting"}, status=status.HTTP_400_BAD_REQUEST)

        owner = User1.objects.get(user_id=owner_id)

        tx_raw = f"mint-{batch_id}-{owner_id}-{now()}"
        tx_hash = hashlib.sha256(tx_raw.encode()).hexdigest()

        credit = Credit.objects.create(
            batch=batch,
            owner=owner,
            amount=amount,
            status="active",
            tx_hash=tx_hash,
        )

        transaction = Transaction.objects.create(
            credit=credit,
            from_user=None,   # Mint has no "from"
            to_user=owner,
            tx_type="mint",
            amount=amount,
            fiat_value_usd=None,
            tx_hash=tx_hash,
        )


        credit_serializer = CreditSerializer(credit)
        transaction_serializer = TransactionSerializer(transaction)

        return Response({
            "message": True,
            "credit": credit_serializer.data,
            "transaction": transaction_serializer.data
        }, status=status.HTTP_201_CREATED)

    except HydrogenBatch.DoesNotExist:
        return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
    except User1.DoesNotExist:
        return Response({"error": "Owner not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
"""@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mint_credit(request):

    try:
        user = request.user  # authenticated user

        if user.role not in ["regulator", "verifier"]:
            return Response(
                {"error": "Only regulators or verifiers can mint credits"},
                status=status.HTTP_403_FORBIDDEN
            )

        data = request.data
        batch_id = data.get("batch_id")
        owner_id = data.get("owner_id")
        amount = data.get("amount")

    
        batch = HydrogenBatch.objects.get(batch_id=batch_id)
        if not batch.is_approved:
            return Response({"error": "Batch not approved for minting"}, status=status.HTTP_400_BAD_REQUEST)


        owner = User1.objects.get(user_id=owner_id)

        tx_raw = f"mint-{batch_id}-{owner_id}-{now()}"
        tx_hash = hashlib.sha256(tx_raw.encode()).hexdigest()

  
        credit = Credit.objects.create(
            batch=batch,
            owner=owner,
            amount=amount,
            status="active",
            tx_hash=tx_hash,
        )

        transaction = Transaction.objects.create(
            credit=credit,
            from_user=None,   # Mint has no "from"
            to_user=owner,
            tx_type="mint",
            amount=amount,
            fiat_value_usd=None,
            tx_hash=tx_hash,
        )

       
        credit_serializer = CreditSerializer(credit)
        transaction_serializer = TransactionSerializer(transaction)

        return Response({
            "message": True,
            "credit": credit_serializer.data,
            "transaction": transaction_serializer.data
        }, status=status.HTTP_201_CREATED)

    except HydrogenBatch.DoesNotExist:
        return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
    except User1.DoesNotExist:
        return Response({"error": "Owner not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)"""


@api_view(["POST"])
def transfer_credit(request):

    try:
        data = request.data

        credit_id = data.get("credit_id")
        to_user_id = data.get("to_user_id")
        amount = data.get("amount")
        fiat_value_usd = amount/5
        credit = Credit.objects.get(credit_id=credit_id)
        from_user = credit.owner
        to_user = User1.objects.get(user_id=to_user_id)

       
        if credit.status != "active":
            return Response({"error": "Credit is not active"}, status=status.HTTP_400_BAD_REQUEST)

        if float(amount) > float(credit.amount):
            return Response({"error": "Insufficient credit amount"}, status=status.HTTP_400_BAD_REQUEST)

        
        tx_raw = f"{credit_id}{from_user.user_id}{to_user.user_id}{now()}"
        tx_hash = hashlib.sha256(tx_raw.encode()).hexdigest()


        transaction = Transaction.objects.create(
            credit=credit,
            from_user=from_user,
            to_user=to_user,
            tx_type="transfer",
            amount=amount,
            fiat_value_usd=fiat_value_usd,
            tx_hash=tx_hash,
        )

        credit.owner = to_user
        credit.status = "transferred"
        credit.save()

      
        serializer = TransactionSerializer(transaction)
        return Response({"message": True, "transaction": serializer.data}, status=status.HTTP_201_CREATED)

    except Credit.DoesNotExist:
        return Response({"error": "Credit not found"}, status=status.HTTP_404_NOT_FOUND)

    except User1.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_batch(request):
    
    try:
        user = request.user

        if user.role not in ["verifier", "regulator"]:
            return Response(
                {"error": "Only verifiers or regulators can approve batches"},
                status=status.HTTP_403_FORBIDDEN
            )

        batch_id = request.data.get("batch_id")
        approve = request.data.get("approve", True)  

        batch = HydrogenBatch.objects.get(batch_id=batch_id)

        if approve:
            batch.is_approved = True
            message = f"Batch {batch_id} verified successfully ✅"
        else:
            batch.is_approved = False
            message = f"Batch {batch_id} rejected ❌"

        batch.save()

        return Response({"message": message, "batch_id": batch_id, "is_approved": batch.is_approved}, status=status.HTTP_200_OK)

    except HydrogenBatch.DoesNotExist:
        return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def use_credit(request):
    
    try:
        user = request.user

        credit_id = request.data.get("credit_id")
        amount = request.data.get("amount")

        if not credit_id or not amount:
            return Response({"error": "credit_id and amount are required"}, status=status.HTTP_400_BAD_REQUEST)

        credit = Credit.objects.get(credit_id=credit_id, owner=user)

        if amount > credit.amount:
            return Response({"error": "Insufficient credit balance"}, status=status.HTTP_400_BAD_REQUEST)

        credit.amount -= amount
        if credit.amount == 0:
            credit.status = "burned"
        credit.save()

        raw_data = f"{credit_id}{user.user_id}{amount}{time.time()}"
        tx_hash = hashlib.sha256(raw_data.encode()).hexdigest()

        tx = Transaction.objects.create(
            credit=credit,
            from_user=user,
            to_user=None,  # since credits are burned, no receiver
            tx_type="burn",
            amount=amount,
            fiat_value_usd=None,
            tx_hash=tx_hash
        )

        return Response(
            {
                "message": "Credit used successfully ✅",
                "credit_id": credit.credit_id,
                "remaining_amount": credit.amount,
                "tx_id": tx.tx_id,
                "tx_hash": tx_hash
            },
            status=status.HTTP_200_OK
        )

    except Credit.DoesNotExist:
        return Response({"error": "Credit not found or not owned by you"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    try:
        user = request.user

        total_credits = Credit.objects.filter(owner=user, status="active").aggregate(total=Sum("amount"))["total"] or 0

        today = now().date()
        week_start = today - timedelta(days=7)

        credits_traded_today = Transaction.objects.filter(
            tx_type="transfer", timestamp__date=today
        ).aggregate(total=Sum("amount"))["total"] or 0

        credits_traded_week = Transaction.objects.filter(
            tx_type="transfer", timestamp__date__gte=week_start
        ).aggregate(total=Sum("amount"))["total"] or 0

        recent_tx = Transaction.objects.filter(tx_type="transfer").order_by("-timestamp")[:10]
        if recent_tx.exists():
            avg_price = sum([float(t.fiat_value_usd or 0) / float(t.amount or 1) for t in recent_tx]) / len(recent_tx)
        else:
            avg_price = 0

        emissions_offset = Transaction.objects.filter(
            tx_type="burn", from_user=user
        ).aggregate(total=Sum("amount"))["total"] or 0

        monthly_target = 12000 
        monthly_progress = (emissions_offset / monthly_target) * 100 if monthly_target > 0 else 0

        trend = []
        for i in range(5, 0, -1):
            day = today - timedelta(days=i)
            day_tx = Transaction.objects.filter(tx_type="transfer", timestamp__date=day)
            if day_tx.exists():
                avg_day_price = sum([float(t.fiat_value_usd or 0) / float(t.amount or 1) for t in day_tx]) / len(day_tx)
            else:
                avg_day_price = avg_price
            trend.append({"date": str(day), "price": round(avg_day_price, 2)})

        return Response(
            {
                "total_credits_owned": total_credits,
                "credits_traded": {
                    "today": credits_traded_today,
                    "this_week": credits_traded_week,
                },
                "market_price": {
                    "current": round(avg_price, 2),
                    "change_24h": "+2.3%",  
                },
                "emissions_offset": {
                    "total": emissions_offset,
                    "monthly_progress": round(monthly_progress, 2),
                    "target": monthly_target,
                },
                "market_price_trend": trend,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)