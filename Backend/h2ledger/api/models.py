#make_password
from django.db import models
from auth1.models import User1
from decimal import Decimal
from django.utils import timezone

class MarketPrice(models.Model):
    """Track market prices over time"""
    price_per_credit = models.DecimalField(max_digits=10, decimal_places=2)
    volume_24h = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"${self.price_per_credit} at {self.timestamp}"

class EmissionsData(models.Model):
    """Track emissions offset data"""
    user = models.ForeignKey(User1, on_delete=models.CASCADE, related_name="emissions_data")
    credits_burned = models.DecimalField(max_digits=12, decimal_places=3)
    co2_offset_kg = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.co2_offset_kg}kg CO2 offset"

class TradingOrder(models.Model):
    """Trading orders for credits"""
    ORDER_TYPES = (
        ('buy', 'Buy'),
        ('sell', 'Sell'),
    )
    
    ORDER_STATUS = (
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(User1, on_delete=models.CASCADE, related_name="trading_orders")
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES)
    credit_batch = models.ForeignKey('HydrogenBatch', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    price_per_credit = models.DecimalField(max_digits=10, decimal_places=2)
    filled_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.order_type.upper()} {self.quantity} credits @ ${self.price_per_credit}"

class HydrogenBatch(models.Model):
    batch_id = models.AutoField(primary_key=True)
    producer = models.ForeignKey(
        User1,
        on_delete=models.CASCADE,
        related_name="hydrogen_batches"
    )
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=3)
    production_date = models.DateField()
    certification = models.TextField(blank=True, null=True)  
    is_approved = models.BooleanField(default=False) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Batch {self.batch_id} - {self.producer.name} ({self.quantity_kg} kg)"


class Credit(models.Model):
    STATUS_CHOICES = (
        ("active", "Active"),
        ("transferred", "Transferred"),
        ("burned", "Burned"),
    )

    credit_id = models.AutoField(primary_key=True)
    batch = models.ForeignKey(
        HydrogenBatch,
        on_delete=models.CASCADE,
        related_name="credits"
    )
    owner = models.ForeignKey(
        User1,
        on_delete=models.CASCADE,
        related_name="owned_credits"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=3)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="active")
    tx_hash = models.CharField(max_length=100, unique=True, blank=True, null=True)  # blockchain reference
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Credit {self.credit_id} - Owner: {self.owner.name}, Status: {self.status}"
    

class Transaction(models.Model):
    TX_TYPE_CHOICES = (
        ("mint", "Mint"),
        ("transfer", "Transfer"),
        ("burn", "Burn"),
        ("purchase", "Purchase"),
    )

    tx_id = models.AutoField(primary_key=True)
    credit = models.ForeignKey(
        Credit,
        on_delete=models.CASCADE,
        related_name="transactions"
    )
    from_user = models.ForeignKey(
        User1,
        on_delete=models.CASCADE,
        related_name="transactions_sent",
        null=True, blank=True
    )
    to_user = models.ForeignKey(
        User1,
        on_delete=models.CASCADE,
        related_name="transactions_received",
        null=True, blank=True
    )
    tx_type = models.CharField(max_length=50, choices=TX_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=3)
    fiat_value_usd = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    tx_hash = models.CharField(max_length=100, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tx {self.tx_id} | {self.tx_type} | Credit {self.credit.credit_id}"
    
class Payment(models.Model):
    METHOD_CHOICES = (
        ("crypto", "Crypto"),
        ("fiat", "Fiat"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    )

    payment_id = models.AutoField(primary_key=True)
    buyer = models.ForeignKey(
        User1,
        on_delete=models.CASCADE,
        related_name="payments"
    )
    amount_usd = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=METHOD_CHOICES)
    tx_hash = models.CharField(max_length=100, blank=True, null=True)   # used if crypto
    payment_ref = models.CharField(max_length=100, blank=True, null=True)  # used if fiat
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.payment_id} - {self.buyer.name} ({self.amount_usd} USD)"