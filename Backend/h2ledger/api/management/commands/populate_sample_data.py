from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import random

from api.models import *
from auth1.models import User1


class Command(BaseCommand):
    help = 'Populate database with sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database population...'))
        
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
            self.stdout.write(f'Created test user: {user.email}')
        
        # Create hydrogen batch
        batch, created = HydrogenBatch.objects.get_or_create(
            producer='Green Energy Co.',
            defaults={
                'production_date': timezone.now().date() - timedelta(days=30),
                'quantity_kg': Decimal('1000.000'),
                'purity_percentage': Decimal('99.50'),
                'certification_standard': 'ISO 14687',
                'verification_status': 'verified'
            }
        )
        if created:
            self.stdout.write(f'Created hydrogen batch: {batch.id}')
        
        # Create credits for the user
        credit_count = Credit.objects.filter(owner=user).count()
        if credit_count == 0:
            for i in range(5):
                Credit.objects.create(
                    owner=user,
                    batch=batch,
                    amount=Decimal(str(random.randint(10, 100))),
                    status='active',
                    blockchain_tx_hash=f'0x{random.randint(10**40, 10**41):041x}'
                )
            self.stdout.write(f'Created 5 credits for user')
        
        # Create market prices for the last 7 days
        market_price_count = MarketPrice.objects.count()
        if market_price_count == 0:
            base_price = Decimal('50.00')
            for i in range(7):
                price_variation = Decimal(str(random.uniform(-5, 5)))
                price = base_price + price_variation
                volume = Decimal(str(random.randint(100, 1000)))
                
                MarketPrice.objects.create(
                    price_per_credit=price,
                    volume_24h=volume,
                    timestamp=timezone.now() - timedelta(days=i)
                )
            self.stdout.write(f'Created 7 market price records')
        
        # Create some transactions
        transaction_count = Transaction.objects.filter(from_user=user).count()
        if transaction_count == 0:
            credits = Credit.objects.filter(owner=user)
            
            # Purchase transactions
            for i in range(3):
                Transaction.objects.create(
                    from_user=user,
                    to_user=user,
                    tx_type='purchase',
                    amount=Decimal(str(random.randint(5, 20))),
                    fiat_value_usd=Decimal(str(random.randint(250, 1000))),
                    blockchain_tx_hash=f'0x{random.randint(10**40, 10**41):041x}',
                    timestamp=timezone.now() - timedelta(days=random.randint(1, 30))
                )
            
            # Burn transaction (for emissions offset)
            Transaction.objects.create(
                from_user=user,
                to_user=None,
                tx_type='burn',
                amount=Decimal('15.000'),
                fiat_value_usd=Decimal('750.00'),
                blockchain_tx_hash=f'0x{random.randint(10**40, 10**41):041x}',
                timestamp=timezone.now() - timedelta(days=5)
            )
            
            # Transfer transaction
            Transaction.objects.create(
                from_user=user,
                to_user=user,  # Self-transfer for demo
                tx_type='transfer',
                amount=Decimal('8.000'),
                fiat_value_usd=Decimal('400.00'),
                blockchain_tx_hash=f'0x{random.randint(10**40, 10**41):041x}',
                timestamp=timezone.now() - timedelta(days=2)
            )
            
            self.stdout.write(f'Created sample transactions')
        
        # Create emissions data
        emissions_count = EmissionsData.objects.filter(user=user).count()
        if emissions_count == 0:
            EmissionsData.objects.create(
                user=user,
                credits_burned=Decimal('15.000'),
                co2_offset_kg=Decimal('150.00')  # 1 credit = 10kg CO2 offset
            )
            self.stdout.write(f'Created emissions data')
        
        self.stdout.write(
            self.style.SUCCESS('Database population completed successfully!')
        )
