from rest_framework import serializers
from .models import *


class HydrogenBatchSerializer(serializers.ModelSerializer):
    producer_name = serializers.CharField(source="producer.name", read_only=True)
    producer_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = HydrogenBatch
        fields = [
            "batch_id",
            "producer_id",
            "producer_name",
            "quantity_kg",
            "production_date",
            "certification",
            "is_approved",
            "created_at",
        ]
        read_only_fields = ("batch_id", "created_at", "producer_name")

class CreditSerializer(serializers.ModelSerializer):

    batch_id = serializers.IntegerField(write_only=True)
    owner_id = serializers.IntegerField(write_only=True)

    # batch_info = serializers.IntegerField(source="batch.batch_id", read_only=True)
    owner_name = serializers.CharField(source="owner.name", read_only=True)

    class Meta:
        model = Credit
        fields = [
            "credit_id",
            "batch_id",       
            # "batch_info",    
            "owner_id",       
            "owner_name",    
            "amount",
            "status",
            "tx_hash",
            "created_at",
        ]
        read_only_fields = (
            "credit_id",
            "created_at",
            # "batch_info",
            "owner_name",
        )

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Credit amount must be greater than zero.")
        return value

    def validate_status(self, value):
        valid_statuses = ["active", "transferred", "burned"]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of {valid_statuses}.")
        return value
    
class TransactionSerializer(serializers.ModelSerializer):
    credit_id = serializers.IntegerField(write_only=True)
    from_user_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    to_user_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    # Read-only expanded info
    # credit_info = serializers.IntegerField(source="credit.credit_id", read_only=True)
    from_user_name = serializers.CharField(source="from_user.name", read_only=True)
    to_user_name = serializers.CharField(source="to_user.name", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "tx_id",
            "credit_id",
            # "credit_info",
            "from_user_id",
            "from_user_name",
            "to_user_id",
            "to_user_name",
            "tx_type",
            "amount",
            "fiat_value_usd",
            "tx_hash",
            "timestamp",
        ]
        read_only_fields = (
            "tx_id",
            # "credit_info",
            "from_user_name",
            "to_user_name",
            "timestamp",
        )

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Transaction amount must be greater than zero.")
        return value

    def validate_tx_type(self, value):
        valid_types = ["mint", "transfer", "burn", "purchase"]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid tx_type. Must be one of {valid_types}.")
        return value
    
class PaymentSerializer(serializers.ModelSerializer):
    buyer_id = serializers.IntegerField(write_only=True)
    buyer_name = serializers.CharField(source="buyer.name", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "payment_id",
            "buyer_id",
            "buyer_name",
            "amount_usd",
            "payment_method",
            "tx_hash",
            "payment_ref",
            "status",
            "created_at",
        ]
        read_only_fields = ("payment_id", "buyer_name", "created_at")

    def validate(self, data):
        method = data.get("payment_method")

        # If crypto → tx_hash required
        if method == "crypto" and not data.get("tx_hash"):
            raise serializers.ValidationError("tx_hash is required for crypto payments.")

        # If fiat → payment_ref required
        if method == "fiat" and not data.get("payment_ref"):
            raise serializers.ValidationError("payment_ref is required for fiat payments.")

        return data