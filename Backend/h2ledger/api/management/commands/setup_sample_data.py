from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta

from api.models import *
from auth1.models import User1


class Command(BaseCommand):
    help = 'Set up sample data for H2Ledger dashboard testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating sample data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Transaction.objects.all().delete()
            Credit.objects.all().delete()
            HydrogenBatch.objects.all().delete()
            MarketPrice.objects.all().delete()
            EmissionsData.objects.all().delete()
            TradingOrder.objects.all().delete()

        self.stdout.write('Creating sample data...')
        
        # Create or get test users
        producer, _ = User1.objects.get_or_create(
            email='producer@test.com',
            defaults={
                'name': 'Test Producer',
                'password': 'testpass123',
                'role': 'producer'
            }
        )
        
        consumer, _ = User1.objects.get_or_create(
            email='consumer@test.com',
            defaults={
                'name': 'Test Consumer',
                'password': 'testpass123',
                'role': 'consumer'
            }
        )

        # Create hydrogen batches
        batch1 = HydrogenBatch.objects.create(
            producer=producer,
            quantity_kg=Decimal('1000.000'),
            production_date=timezone.now().date() - timedelta(days=30),
            certification='Green hydrogen certified',
            is_approved=True
        )

        batch2 = HydrogenBatch.objects.create(
            producer=producer,
            quantity_kg=Decimal('750.000'),
            production_date=timezone.now().date() - timedelta(days=15),
            certification='Blue hydrogen certified',
            is_approved=True
        )

        # Create credits
        credit1 = Credit.objects.create(
            batch=batch1,
            owner=consumer,
            amount=Decimal('500.000'),
            status='active',
            tx_hash='0x1234567890abcdef'
        )

        credit2 = Credit.objects.create(
            batch=batch2,
            owner=consumer,
            amount=Decimal('300.000'),
            status='active',
            tx_hash='0xfedcba0987654321'
        )

        # Create market prices for the last 7 days
        base_price = 50.0
        for i in range(7):
            date = timezone.now() - timedelta(days=i)
            price_variation = random.uniform(-5, 5)
            price = max(base_price + price_variation, 30.0)  # Minimum price 30
            
            MarketPrice.objects.create(
                price_per_credit=Decimal(str(round(price, 2))),
                volume_24h=Decimal(str(random.uniform(100, 1000))),
                timestamp=date
            )

        # Create sample transactions
        for i in range(10):
            tx_date = timezone.now() - timedelta(days=random.randint(0, 30))
            amount = Decimal(str(random.uniform(10, 100)))
            
            Transaction.objects.create(
                credit=credit1,
                from_user=producer,
                to_user=consumer,
                tx_type='transfer',
                amount=amount,
                fiat_value_usd=amount * Decimal('50.00'),
                tx_hash=f'0x{random.randint(100000, 999999)}',
                timestamp=tx_date
            )

        # Create emissions data
        EmissionsData.objects.create(
            user=consumer,
            credits_burned=Decimal('50.000'),
            co2_offset_kg=Decimal('500.00')
        )

        # Create trading orders
        TradingOrder.objects.create(
            user=consumer,
            order_type='buy',
            credit_batch=batch1,
            quantity=Decimal('100.000'),
            price_per_credit=Decimal('48.50'),
            status='pending'
        )

        TradingOrder.objects.create(
            user=producer,
            order_type='sell',
            credit_batch=batch2,
            quantity=Decimal('200.000'),
            price_per_credit=Decimal('52.00'),
            status='pending'
        )

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data for H2Ledger dashboard!')
        )
        self.stdout.write(f'Created:')
        self.stdout.write(f'- 2 users (producer, consumer)')
        self.stdout.write(f'- 2 hydrogen batches')
        self.stdout.write(f'- 2 credits')
        self.stdout.write(f'- 7 market price entries')
        self.stdout.write(f'- 10 transactions')
        self.stdout.write(f'- 1 emissions record')
        self.stdout.write(f'- 2 trading orders')
