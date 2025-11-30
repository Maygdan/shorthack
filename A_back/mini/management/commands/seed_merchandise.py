from django.core.management.base import BaseCommand
from mini.models import CustomUser, Merchandise


class Command(BaseCommand):
    help = 'Creates sample merchandise for testing'

    def handle(self, *args, **options):
        # Get or create a manager user
        manager = CustomUser.objects.filter(user_type='MANAGER').first()
        
        if not manager:
            # Create a new manager if none exists
            phone_base = '9991234567'
            counter = 0
            while CustomUser.objects.filter(phone=phone_base).exists():
                counter += 1
                phone_base = f'999123456{counter}'
            
            manager = CustomUser.objects.create_user(
                username='manager_demo',
                email='manager@x5.ru',
                user_type='MANAGER',
                phone=phone_base,
            )
            manager.set_unusable_password()
            manager.save()
            self.stdout.write(self.style.SUCCESS(f'Created manager: {manager.username}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Using existing manager: {manager.username}'))

        # Create sample merchandise
        merch_items = [
            {
                'name': 'Футболка X5',
                'description': 'Фирменная футболка X5 с логотипом. 100% хлопок, качественная печать.',
                'merch_type': 'T_SHIRT',
                'points_cost': 100,
                'stock_quantity': 50,
            },
            {
                'name': 'Набор стикеров X5',
                'description': 'Коллекция стикеров с логотипом X5 и корпоративными слоганами.',
                'merch_type': 'STICKER',
                'points_cost': 30,
                'stock_quantity': 200,
            },
            {
                'name': 'Толстовка X5',
                'description': 'Теплая толстовка с капюшоном и логотипом X5. Идеально для прохладной погоды.',
                'merch_type': 'HOODIE',
                'points_cost': 200,
                'stock_quantity': 30,
            },
            {
                'name': 'Кепка X5',
                'description': 'Стильная кепка с вышитым логотипом X5. Регулируемый размер.',
                'merch_type': 'CAP',
                'points_cost': 80,
                'stock_quantity': 40,
            },
            {
                'name': 'Эко-сумка X5',
                'description': 'Экологичная сумка из переработанных материалов с логотипом X5.',
                'merch_type': 'BAG',
                'points_cost': 60,
                'stock_quantity': 100,
            },
        ]
        
        created_count = 0
        for merch_data in merch_items:
            merch, created = Merchandise.objects.get_or_create(
                name=merch_data['name'],
                defaults=merch_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created merchandise: {merch.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Merchandise already exists: {merch.name}'))

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully seeded {created_count} merchandise items!'))
        self.stdout.write(self.style.SUCCESS(f'Total available merchandise: {Merchandise.objects.filter(is_available=True).count()}'))

