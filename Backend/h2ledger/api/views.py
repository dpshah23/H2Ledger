from django.shortcuts import render

# Create your views here.

#verify green h2 done from verifier 
#mint generation 
#tranfer -> store in db -> hash ("tx_id","credit_id",# "credit_info","from_user_id","from_user_name","to_user_id","to_user_name","tx_type","amount","fiat_value_usd","tx_hash","timestamp",)
#Use -> store 
import hashlib , time
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated



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
    """
    ✅ Verifier/Regulator approves or rejects a hydrogen batch.
    """
    try:
        user = request.user

        # 1️⃣ Only verifier/regulator can approve
        if user.role not in ["verifier", "regulator"]:
            return Response(
                {"error": "Only verifiers or regulators can approve batches"},
                status=status.HTTP_403_FORBIDDEN
            )

        batch_id = request.data.get("batch_id")
        approve = request.data.get("approve", True)  # default = approve

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
    """
    ✅ Buyer uses (retires/burns) credits.
    """
    try:
        user = request.user

        credit_id = request.data.get("credit_id")
        amount = request.data.get("amount")

        if not credit_id or not amount:
            return Response({"error": "credit_id and amount are required"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔎 Get credit
        credit = Credit.objects.get(credit_id=credit_id, owner=user)

        # ❌ Prevent over-burning
        if amount > credit.amount:
            return Response({"error": "Insufficient credit balance"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔐 Update credit status
        credit.amount -= amount
        if credit.amount == 0:
            credit.status = "burned"
        credit.save()

        # 🔑 Generate tx_hash
        raw_data = f"{credit_id}{user.user_id}{amount}{time.time()}"
        tx_hash = hashlib.sha256(raw_data.encode()).hexdigest()

        # 📝 Store transaction
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