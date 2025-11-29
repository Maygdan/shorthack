from django.core.management.base import BaseCommand
from mini.models import CustomUser, Event, Quiz, QuizQuestion, QuizAnswer, Minigame


class Command(BaseCommand):
    help = 'Creates sample events for testing'

    def handle(self, *args, **options):
        # Get or create a manager user
        # First try to get an existing manager
        manager = CustomUser.objects.filter(user_type='MANAGER').first()
        
        if not manager:
            # Create a new manager if none exists
            # Find a unique phone number
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

        # Create sample Quiz event
        quiz_event, created = Event.objects.get_or_create(
            title='X5 Digital Skills Quiz',
            defaults={
                'description': 'Test your knowledge about digital technologies, programming, and modern IT trends. This quiz covers topics from basic programming concepts to advanced system architecture.',
                'event_type': 'QUIZ',
                'manager': manager,
                'points': 50,
                'is_active': True,
            }
        )
        
        if created:
            # Create quiz for the event
            quiz = Quiz.objects.create(
                event=quiz_event,
                time_limit=600,  # 10 minutes
                passing_score=70
            )
            
            # Add questions
            questions_data = [
                {
                    'question': 'What is React?',
                    'answers': [
                        ('A JavaScript library for building user interfaces', True),
                        ('A database management system', False),
                        ('A programming language', False),
                        ('A web server framework', False),
                    ]
                },
                {
                    'question': 'What does API stand for?',
                    'answers': [
                        ('Application Programming Interface', True),
                        ('Automated Program Integration', False),
                        ('Advanced Programming Interface', False),
                        ('Application Process Integration', False),
                    ]
                },
                {
                    'question': 'Which HTTP method is used for creating resources?',
                    'answers': [
                        ('POST', True),
                        ('GET', False),
                        ('PUT', False),
                        ('DELETE', False),
                    ]
                },
                {
                    'question': 'What is the purpose of JWT tokens?',
                    'answers': [
                        ('Secure authentication and authorization', True),
                        ('Database encryption', False),
                        ('File compression', False),
                        ('Network routing', False),
                    ]
                },
                {
                    'question': 'What is Django?',
                    'answers': [
                        ('A Python web framework', True),
                        ('A JavaScript library', False),
                        ('A database system', False),
                        ('A cloud service', False),
                    ]
                },
            ]
            
            for idx, q_data in enumerate(questions_data, 1):
                question = QuizQuestion.objects.create(
                    quiz=quiz,
                    question_text=q_data['question'],
                    order=idx
                )
                
                for answer_text, is_correct in q_data['answers']:
                    QuizAnswer.objects.create(
                        question=question,
                        answer_text=answer_text,
                        is_correct=is_correct
                    )
            
            self.stdout.write(self.style.SUCCESS(f'Created quiz event: {quiz_event.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Quiz event already exists: {quiz_event.title}'))

        # Create sample Minigame event
        minigame_event, created = Event.objects.get_or_create(
            title='Code Challenge Minigame',
            defaults={
                'description': 'Complete coding challenges and puzzles to earn points. Test your problem-solving skills with fun interactive games.',
                'event_type': 'MINIGAME',
                'manager': manager,
                'points': 30,
                'is_active': True,
            }
        )
        
        if created:
            Minigame.objects.create(
                event=minigame_event,
                game_type='coding_challenge',
                instructions='Solve the coding puzzles by writing correct code snippets. You have 3 attempts to complete each challenge. Good luck!'
            )
            self.stdout.write(self.style.SUCCESS(f'Created minigame event: {minigame_event.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Minigame event already exists: {minigame_event.title}'))

        # Create another Quiz event
        quiz_event2, created = Event.objects.get_or_create(
            title='Python Fundamentals Quiz',
            defaults={
                'description': 'Master the basics of Python programming. This quiz covers variables, data types, control structures, and functions.',
                'event_type': 'QUIZ',
                'manager': manager,
                'points': 40,
                'is_active': True,
            }
        )
        
        if created:
            quiz2 = Quiz.objects.create(
                event=quiz_event2,
                time_limit=450,  # 7.5 minutes
                passing_score=75
            )
            
            questions_data2 = [
                {
                    'question': 'What is the correct way to create a list in Python?',
                    'answers': [
                        ('my_list = [1, 2, 3]', True),
                        ('my_list = (1, 2, 3)', False),
                        ('my_list = {1, 2, 3}', False),
                        ('my_list = "1, 2, 3"', False),
                    ]
                },
                {
                    'question': 'Which keyword is used to define a function in Python?',
                    'answers': [
                        ('def', True),
                        ('function', False),
                        ('define', False),
                        ('func', False),
                    ]
                },
                {
                    'question': 'What does len() function return?',
                    'answers': [
                        ('The number of items in an object', True),
                        ('The length of a string only', False),
                        ('The maximum value in a list', False),
                        ('The type of an object', False),
                    ]
                },
            ]
            
            for idx, q_data in enumerate(questions_data2, 1):
                question = QuizQuestion.objects.create(
                    quiz=quiz2,
                    question_text=q_data['question'],
                    order=idx
                )
                
                for answer_text, is_correct in q_data['answers']:
                    QuizAnswer.objects.create(
                        question=question,
                        answer_text=answer_text,
                        is_correct=is_correct
                    )
            
            self.stdout.write(self.style.SUCCESS(f'Created quiz event: {quiz_event2.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Quiz event already exists: {quiz_event2.title}'))

        self.stdout.write(self.style.SUCCESS('\nSuccessfully seeded sample events!'))
        self.stdout.write(self.style.SUCCESS(f'Total active events: {Event.objects.filter(is_active=True).count()}'))

