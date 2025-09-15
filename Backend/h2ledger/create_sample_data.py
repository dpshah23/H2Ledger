from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import random
from api.models import *
from auth1.models import User1

# Get or create a test user
user, created = User1.objects.get_or_create(
    email='testuser@example.com',
    defaults={
        'name': 'Test User',
        'role': 'consumer',
        'wallet_address': '0x1234567890123456789012345678901234567890'
    }
)
if created:
    user.set_password('testpass123')
    user.save()
print(f'User: {user.email}')

# Create hydrogen batch if none exists
if HydrogenBatch.objects.count() == 0:
    batch = HydrogenBatch.objects.create(
        producer='Green Energy Co.',
        production_date=timezone.now().date() - timedelta(days=30),
        quantity_kg=Decimal('1000.000'),
        purity_percentage=Decimal('99.50'),
        certification_standard='ISO 14687',
        verification_status='verified'
    )
    print(f'Created batch: {batch.id}')
else:
    batch = HydrogenBatch.objects.first()

# Create credits if none exist for user
if Credit.objects.filter(owner=user).count() == 0:
    for i in range(5):
        Credit.objects.create(
            owner=user,
            batch=batch,
            amount=Decimal(str(random.randint(20, 100))),
            status='active',
            blockchain_tx_hash=f'0x{random.randint(10**40, 10**41):041x}'
        )
    print('Created 5 credits')

# Create market prices if none exist
if MarketPrice.objects.count() == 0:
    base_price = Decimal('50.00')
    for i in range(7):
        price_variation = Decimal(str(random.uniform(-5, 5)))
        price = max(base_price + price_variation, Decimal('1.00'))
        volume = Decimal(str(random.randint(100, 1000)))
        
        MarketPrice.objects.create(
            price_per_credit=price,
            volume_24h=volume,
            timestamp=timezone.now() - timedelta(days=i)
        )
    print('Created 7 market prices')

# Create transactions if none exist for user
if Transaction.objects.filter(from_user=user).count() == 0:
    # Purchase transactions
    for i in range(3):
        Transaction.objects.create(
            from_user=user,
            to_user=user,
            tx_type='purchase',
            amount=Decimal(str(random.randint(10, 30))),
            fiat_value_usd=Decimal(str(random.randint(500, 1500))),
            blockchain_tx_hash=f'0x{random.randint(10**40, 10**41):041x}',
            timestamp=timezone.now() - timedelta(days=random.randint(1, 6))
        )
    
    # Burn transaction
    Transaction.objects.create(
        from_user=user,
        to_user=None,
        tx_type='burn',
        amount=Decimal('25.000'),
        fiat_value_usd=Decimal('1250.00'),
        blockchain_tx_hash=f'0x{random.randint(10**40, 10**41):041x}',
        timestamp=timezone.now() - timedelta(days=3)
    )
    
    # Today's transaction
    Transaction.objects.create(
        from_user=user,
        to_user=user,
        tx_type='transfer',
        amount=Decimal('12.000'),
        fiat_value_usd=Decimal('600.00'),
        blockchain_tx_hash=f'0x{random.randint(10**40, 10**41):041x}',
        timestamp=timezone.now() - timedelta(hours=2)
    )
    
    print('Created sample transactions')

print('Sample data creation completed!')
