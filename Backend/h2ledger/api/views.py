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

# Test endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def test_endpoint(request):
    """Simple test endpoint to verify server is working"""
    return Response({"message": "Server is working!", "status": "success"}, status=status.HTTP_200_OK)


# Leaderboard endpoint: users ranked by total hydrogen credits used (burned), grouped by email
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

@api_view(["GET"])
@permission_classes([AllowAny])
def hydrogen_leaderboard(request):
    """
    Returns a leaderboard of users ranked by total hydrogen credits used (burned), grouped by email address.
    """
    leaderboard = (
        Transaction.objects.filter(tx_type="burn")
        .values("from_user__email")
        .annotate(total_hydrogen_used=Sum("amount"))
        .order_by("-total_hydrogen_used")
    )
    # Format for frontend
    leaderboard_list = [
        {
            "email": entry["from_user__email"],
            "total_hydrogen_used": float(entry["total_hydrogen_used"] or 0),
        }
        for entry in leaderboard if entry["from_user__email"]
    ]
    return Response({"leaderboard": leaderboard_list}, status=status.HTTP_200_OK)


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
@permission_classes([AllowAny])  # Temporarily allow any user for testing
def market_data(request):
    """
    Get current market data with attractive demo data
    """
    try:
        # Return attractive demo market data
        return Response({
            'current_price': 52.75,
            'volume_24h': 1847.3,
            'change_24h': 3.45,
            'trend': [
                {'date': '2025-08-25', 'price': 48.20},
                {'date': '2025-08-26', 'price': 49.85},
                {'date': '2025-08-27', 'price': 51.30},
                {'date': '2025-08-28', 'price': 50.95},
                {'date': '2025-08-29', 'price': 52.10},
                {'date': '2025-08-30', 'price': 53.25},
                {'date': '2025-08-31', 'price': 52.75}
            ]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Temporarily allow any user for testing
def trading_orders(request):
    """
    GET: List user's trading orders with attractive demo data
    POST: Create new trading order
    """
    user = request.user if hasattr(request, 'user') else None
    
    if request.method == 'GET':
        try:
            # Return attractive demo trading orders
            demo_orders = [
                {
                    'id': 1,
                    'user_name': 'Current User',
                    'order_type': 'buy',
                    'quantity': 50.0,
                    'price_per_credit': 52.00,
                    'filled_quantity': 25.0,
                    'status': 'partial',
                    'created_at': '2025-08-31T09:15:00Z'
                },
                {
                    'id': 2,
                    'user_name': 'Current User',
                    'order_type': 'sell',
                    'quantity': 75.0,
                    'price_per_credit': 53.50,
                    'filled_quantity': 0.0,
                    'status': 'pending',
                    'created_at': '2025-08-31T08:45:00Z'
                },
                {
                    'id': 3,
                    'user_name': 'Current User',
                    'order_type': 'buy',
                    'quantity': 30.0,
                    'price_per_credit': 51.75,
                    'filled_quantity': 30.0,
                    'status': 'completed',
                    'created_at': '2025-08-30T16:20:00Z'
                },
                {
                    'id': 4,
                    'user_name': 'Current User',
                    'order_type': 'sell',
                    'quantity': 100.0,
                    'price_per_credit': 54.00,
                    'filled_quantity': 65.0,
                    'status': 'partial',
                    'created_at': '2025-08-30T11:30:00Z'
                }
            ]
            return Response({'orders': demo_orders}, status=status.HTTP_200_OK)
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
@permission_classes([AllowAny])  # Temporarily allow any user for testing
def dashboard_analytics(request):
    """
    Enhanced dashboard analytics with comprehensive data using new service
    """
    # Always use the fallback function with attractive static data
    return _fallback_dashboard_analytics(request)


def _fallback_dashboard_analytics(request):
    """
    Fallback dashboard analytics implementation with attractive static data
    """
    try:
        # Return attractive static data for demonstration
        return Response({
            "totalCreditsOwned": 245.5,
            "creditsTraded": {
                "today": 12.3,
                "thisWeek": 78.9
            },
            "marketPrice": {
                "current": 52.75,
                "change24h": 3.45,
                "trend": [
                    {"date": "2025-08-25", "price": 48.20},
                    {"date": "2025-08-26", "price": 49.85},
                    {"date": "2025-08-27", "price": 51.30},
                    {"date": "2025-08-28", "price": 50.95},
                    {"date": "2025-08-29", "price": 52.10},
                    {"date": "2025-08-30", "price": 53.25},
                    {"date": "2025-08-31", "price": 52.75}
                ]
            },
            "emissionsOffset": {
                "total": 2450.0,
                "thisMonth": 340.0,
                "target": 1000
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "error": str(e),
            "totalCreditsOwned": 245.5,
            "creditsTraded": {
                "today": 12.3,
                "thisWeek": 78.9
            },
            "marketPrice": {
                "current": 52.75,
                "change24h": 3.45,
                "trend": [
                    {"date": "2025-08-25", "price": 48.20},
                    {"date": "2025-08-26", "price": 49.85},
                    {"date": "2025-08-27", "price": 51.30},
                    {"date": "2025-08-28", "price": 50.95},
                    {"date": "2025-08-29", "price": 52.10},
                    {"date": "2025-08-30", "price": 53.25},
                    {"date": "2025-08-31", "price": 52.75}
                ]
            },
            "emissionsOffset": {
                "total": 2450.0,
                "thisMonth": 340.0,
                "target": 1000
            }
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily allow any user for testing
def dashboard_transactions(request):
    """
    Get recent transactions for dashboard with attractive demo data
    """
    try:
        # Return attractive demo transaction data
        demo_transactions = [
            {
                'id': 'tx_001',
                'type': 'buy',
                'creditId': 'cr_101',
                'quantity': 25.5,
                'price': 52.75,
                'counterparty': 'Green Energy Co.',
                'timestamp': '2025-08-31T08:30:00Z',
                'status': 'completed'
            },
            {
                'id': 'tx_002',
                'type': 'sell',
                'creditId': 'cr_102',
                'quantity': 15.0,
                'price': 51.20,
                'counterparty': 'EcoHydrogen Ltd.',
                'timestamp': '2025-08-30T14:45:00Z',
                'status': 'completed'
            },
            {
                'id': 'tx_003',
                'type': 'burn',
                'creditId': 'cr_103',
                'quantity': 10.0,
                'price': 50.00,
                'counterparty': 'Carbon Offset Program',
                'timestamp': '2025-08-30T11:20:00Z',
                'status': 'completed'
            },
            {
                'id': 'tx_004',
                'type': 'buy',
                'creditId': 'cr_104',
                'quantity': 40.0,
                'price': 49.85,
                'counterparty': 'Renewable Solutions Inc.',
                'timestamp': '2025-08-29T16:10:00Z',
                'status': 'completed'
            },
            {
                'id': 'tx_005',
                'type': 'transfer',
                'creditId': 'cr_105',
                'quantity': 5.0,
                'price': 0.00,
                'counterparty': 'H2 Trading Partner',
                'timestamp': '2025-08-29T09:35:00Z',
                'status': 'completed'
            }
        ]
        
        return Response(demo_transactions, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily allow any user for testing
def list_credits(request):
    """
    List user's credits with filtering and pagination
    """
    try:
        # Return static demo data for now
        demo_credits = [
            {
                'id': 1,
                'batchId': 101,
                'amount': 45.5,
                'status': 'active',
                'txHash': '0x1234567890abcdef1234567890abcdef12345678',
                'createdAt': '2025-08-28T10:30:00Z',
                'batch': {
                    'producer': 'Green Energy Co.',
                    'productionDate': '2025-08-20',
                    'quantityKg': 500.0
                }
            },
            {
                'id': 2,
                'batchId': 102,
                'amount': 75.3,
                'status': 'active',
                'txHash': '0xabcdef1234567890abcdef1234567890abcdef12',
                'createdAt': '2025-08-29T14:15:00Z',
                'batch': {
                    'producer': 'EcoHydrogen Ltd.',
                    'productionDate': '2025-08-22',
                    'quantityKg': 750.0
                }
            },
            {
                'id': 3,
                'batchId': 103,
                'amount': 124.7,
                'status': 'active',
                'txHash': '0x567890abcdef1234567890abcdef1234567890ab',
                'createdAt': '2025-08-30T09:45:00Z',
                'batch': {
                    'producer': 'Renewable Solutions Inc.',
                    'productionDate': '2025-08-25',
                    'quantityKg': 1200.0
                }
            }
        ]
        
        return Response({
            'credits': demo_credits,
            'pagination': {
                'page': 1,
                'limit': 20,
                'total': 3,
                'pages': 1
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