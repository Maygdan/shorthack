from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db import models
from django.conf import settings
from .models import CustomUser, Event, Quiz, QuizQuestion, QuizAnswer, EventParticipation, Feedback, Minigame, PointTransaction, Merchandise, MerchOrder
from .serializers import UserSerializer, EventSerializer, QuizSerializer, FeedbackSerializer, MinigameSerializer, MerchandiseSerializer, MerchOrderSerializer
from rest_framework.permissions import AllowAny

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Для регистрации теперь нужен только телефон
        phone = request.data.get('phone', '').strip()
        phone_clean = ''.join(filter(str.isdigit, phone))
        
        if phone_clean.startswith('7') or phone_clean.startswith('8'):
            phone_clean = phone_clean[1:]
        
        if not phone_clean or len(phone_clean) < 10:
            return Response({'error': 'Неверный номер телефона'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем, не существует ли уже пользователь с таким телефоном
        if CustomUser.objects.filter(phone=phone_clean).exists():
            return Response({'error': 'Пользователь с таким номером телефона уже существует'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Создаем пользователя
        username = f"user_{phone_clean}"
        user = CustomUser.objects.create_user(
            username=username,
            email=f"{username}@x5.ru",
            password=None,
            phone=phone_clean,
            user_type=request.data.get('user_type', 'STUDENT')
        )
        user.set_unusable_password()
        user.save()
        
        # Генерация JWT токена
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone', '').strip()
        
        # Очищаем телефон от всех символов кроме цифр
        phone_clean = ''.join(filter(str.isdigit, phone))
        
        if not phone_clean or len(phone_clean) < 10:
            return Response({'error': 'Неверный номер телефона'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Нормализуем телефон (убираем 7 или 8 в начале, если есть)
        if phone_clean.startswith('7') or phone_clean.startswith('8'):
            phone_clean = phone_clean[1:]
        
        # Ищем пользователя по телефону (точное совпадение)
        user = None
        try:
            user = CustomUser.objects.get(phone=phone_clean)
        except CustomUser.DoesNotExist:
            # Если пользователь не найден, создаем нового студента
            # В реальной системе здесь была бы отправка SMS-кода
            try:
                username = f"user_{phone_clean}"
                # Проверяем, не существует ли уже пользователь с таким username
                if CustomUser.objects.filter(username=username).exists():
                    username = f"user_{phone_clean}_{int(timezone.now().timestamp())}"
                
                user = CustomUser.objects.create_user(
                    username=username,
                    email=f"{username}@x5.ru",
                    password=None,  # Без пароля
                    phone=phone_clean,
                    user_type='STUDENT'
                )
                # Устанавливаем unusable password, так как Django требует пароль
                user.set_unusable_password()
                user.save()
            except Exception as e:
                # Если ошибка из-за дубликата телефона (race condition), пытаемся найти существующего
                if 'phone' in str(e).lower() or 'unique' in str(e).lower():
                    try:
                        user = CustomUser.objects.get(phone=phone_clean)
                    except CustomUser.DoesNotExist:
                        # Пробуем найти по окончанию (на случай разных форматов)
                        users = CustomUser.objects.filter(phone__endswith=phone_clean)
                        if users.exists():
                            user = users.first()
                        else:
                            # В крайнем случае используем get_or_create
                            user, created = CustomUser.objects.get_or_create(
                                phone=phone_clean,
                                defaults={
                                    'username': username,
                                    'email': f"{username}@x5.ru",
                                    'user_type': 'STUDENT'
                                }
                            )
                            if created:
                                user.set_unusable_password()
                                user.save()
        except CustomUser.MultipleObjectsReturned:
            # Если найдено несколько пользователей, берем первого
            user = CustomUser.objects.filter(phone=phone_clean).first()
        except Exception as e:
            return Response({'error': f'Ошибка при входе: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if not user:
            return Response({'error': 'Не удалось найти или создать пользователя'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Генерируем токены
        try:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Проверяем, что токены не пустые и имеют правильный формат
            if not access_token or not refresh_token:
                return Response({'error': 'Ошибка при генерации токенов: пустые токены'}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Проверяем формат JWT (должен содержать 3 части, разделенные точками)
            if len(access_token.split('.')) != 3:
                return Response({'error': 'Ошибка при генерации токенов: неверный формат access token'}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if len(refresh_token.split('.')) != 3:
                return Response({'error': 'Ошибка при генерации токенов: неверный формат refresh token'}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': access_token,
                'refresh': refresh_token,
            })
        except Exception as e:
            import traceback
            return Response({
                'error': f'Ошибка при генерации токенов: {str(e)}',
                'traceback': traceback.format_exc() if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EventListView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Все пользователи видят активные мероприятия
        return Event.objects.filter(is_active=True)

    def perform_create(self, serializer):
        # Все пользователи могут создавать мероприятия
        serializer.save(manager=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        event = self.get_object()
        # Увеличиваем счетчик просмотров
        event.views_count += 1
        event.save(update_fields=['views_count'])
        
        # Создаем запись о просмотре
        EventParticipation.objects.get_or_create(
            event=event,
            student=request.user,
            defaults={'first_viewed': timezone.now()}
        )
        
        return super().get(request, *args, **kwargs)

class StartEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Создаем запись о начале участия
        participation, created = EventParticipation.objects.get_or_create(
            event=event,
            student=request.user,
            defaults={'first_viewed': timezone.now()}
        )
        
        # Возвращаем данные в зависимости от типа мероприятия
        if event.event_type == 'QUIZ':
            quiz = Quiz.objects.get(event=event)
            return Response({
                'event_type': 'QUIZ',
                'quiz': QuizSerializer(quiz).data
            })
        elif event.event_type == 'MINIGAME':
            minigame = Minigame.objects.get(event=event)
            return Response({
                'event_type': 'MINIGAME',
                'minigame': MinigameSerializer(minigame).data
            })
        
        return Response({'error': 'Invalid event type'}, status=status.HTTP_400_BAD_REQUEST)

class SubmitQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id, event_type='QUIZ')
            quiz = Quiz.objects.get(event=event)
        except (Event.DoesNotExist, Quiz.DoesNotExist):
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
        
        answers = request.data.get('answers', [])
        correct_count = 0
        total_questions = quiz.questions.count()
        
        # Проверяем ответы
        for answer_data in answers:
            question_id = answer_data.get('question_id')
            answer_id = answer_data.get('answer_id')
            
            try:
                question = QuizQuestion.objects.get(id=question_id, quiz=quiz)
                answer = QuizAnswer.objects.get(id=answer_id, question=question)
                
                if answer.is_correct:
                    correct_count += 1
            except (QuizQuestion.DoesNotExist, QuizAnswer.DoesNotExist):
                continue
        
        # Рассчитываем процент
        score_percent = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        score = int(score_percent)
        
        # Сохраняем результат
        participation, created = EventParticipation.objects.update_or_create(
            event=event,
            student=request.user,
            defaults={
                'completed': score_percent >= quiz.passing_score,
                'score': score,
                'completed_at': timezone.now() if score_percent >= quiz.passing_score else None
            }
        )
        
        # Начисляем баллы, если прошел
        if participation.completed:
            student_profile = request.user.student_profile
            student_profile.points += event.points
            student_profile.save()
            
            # Создаем запись о транзакции
            PointTransaction.objects.create(
                student=request.user,
                event=event,
                points=event.points,
                transaction_type='EARNED',
                description=f"Completed event: {event.title}"
            )
            
            # Обновляем счетчик завершений
            event.completion_count += 1
            event.save(update_fields=['completion_count'])
        
        return Response({
            'score': score,
            'total_questions': total_questions,
            'correct_count': correct_count,
            'passed': participation.completed,
            'points_earned': event.points if participation.completed else 0,
            'current_points': request.user.student_profile.points
        })

class FeedbackView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Проверяем, завершил ли студент мероприятие
        try:
            participation = EventParticipation.objects.get(event=event, student=request.user)
            if not participation.completed:
                return Response({'error': 'You must complete the event first'}, 
                               status=status.HTTP_400_BAD_REQUEST)
        except EventParticipation.DoesNotExist:
            return Response({'error': 'No participation record found'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем, не оставлял ли уже обратную связь
        if Feedback.objects.filter(event=event, student=request.user).exists():
            return Response({'error': 'Feedback already submitted'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Создаем обратную связь
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            feedback = serializer.save(event=event, student=request.user)
            return Response(FeedbackSerializer(feedback).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompletedEventsView(APIView):
    """Получить список завершенных мероприятий студента"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Получаем все завершенные мероприятия пользователя
        participations = EventParticipation.objects.filter(
            student=request.user,
            completed=True
        ).select_related('event')
        
        events = [participation.event for participation in participations]
        
        # Исключаем мероприятия, на которые уже оставлен отзыв
        events_with_feedback = Feedback.objects.filter(
            student=request.user
        ).values_list('event_id', flat=True)
        
        events = [event for event in events if event.id not in events_with_feedback]
        
        return Response({
            'events': EventSerializer(events, many=True).data
        })

class MyFeedbacksView(APIView):
    """Получить все отзывы студента"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        feedbacks = Feedback.objects.filter(student=request.user).order_by('-created_at')
        return Response({
            'feedbacks': FeedbackSerializer(feedbacks, many=True).data
        })

class ManagerAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, event_id=None):
        if event_id:
            # Аналитика по конкретному мероприятию
            try:
                event = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                return Response({'error': 'Event not found'}, 
                               status=status.HTTP_404_NOT_FOUND)
            
            participants = EventParticipation.objects.filter(event=event)
            completed = participants.filter(completed=True)
            
            return Response({
                'event': EventSerializer(event).data,
                'total_views': event.views_count,
                'total_participants': participants.count(),
                'completed_count': completed.count(),
                'completion_rate': f"{(completed.count() / participants.count() * 100):.1f}%" if participants.count() > 0 else "0%",
                'average_score': completed.aggregate(models.Avg('score'))['score__avg'] or 0,
                'feedback_count': Feedback.objects.filter(event=event).count(),
                'recent_feedbacks': FeedbackSerializer(
                    Feedback.objects.filter(event=event).order_by('-created_at')[:5], 
                    many=True
                ).data
            })
        
        # Аналитика по всем мероприятиям
        events = Event.objects.all()
        total_events = events.count()
        total_views = events.aggregate(models.Sum('views_count'))['views_count__sum'] or 0
        total_completions = events.aggregate(models.Sum('completion_count'))['completion_count__sum'] or 0
        
        # Метрики по квизам
        quiz_events = events.filter(event_type='QUIZ')
        quiz_participations = EventParticipation.objects.filter(
            event__in=quiz_events
        )
        
        total_quiz_attempts = quiz_participations.count()
        successful_quiz_attempts = quiz_participations.filter(completed=True).count()
        failed_quiz_attempts = quiz_participations.filter(completed=False).count()
        
        # Количество новых пользователей (студентов, зарегистрированных впервые)
        # Можно считать всех студентов или только тех, кто участвовал в мероприятиях менеджера
        students_participated = CustomUser.objects.filter(
            participations__event__in=events
        ).distinct().count()
        
        # Общее количество пользователей в системе
        total_students = CustomUser.objects.count()
        
        return Response({
            'total_events': total_events,
            'total_views': total_views,
            'total_completions': total_completions,
            'average_completion_rate': f"{(total_completions / total_views * 100):.1f}%" if total_views > 0 else "0%",
            'recent_events': EventSerializer(events.order_by('-created_at')[:5], many=True).data,
            # Метрики по квизам
            'total_quiz_attempts': total_quiz_attempts,
            'successful_quiz_attempts': successful_quiz_attempts,
            'failed_quiz_attempts': failed_quiz_attempts,
            # Метрики по пользователям
            'total_students': total_students,
            'students_participated': students_participated
        })

class MerchandiseListView(generics.ListAPIView):
    """Список доступного мерча"""
    serializer_class = MerchandiseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Merchandise.objects.filter(is_available=True)

class MerchandiseDetailView(generics.RetrieveAPIView):
    """Детали конкретного мерча"""
    queryset = Merchandise.objects.filter(is_available=True)
    serializer_class = MerchandiseSerializer
    permission_classes = [permissions.IsAuthenticated]

class PurchaseMerchView(APIView):
    """Покупка мерча за баллы"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, merch_id):
        if request.user.user_type != 'STUDENT':
            return Response({'error': 'Только студенты могут покупать мерч'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        try:
            merchandise = Merchandise.objects.get(id=merch_id, is_available=True)
        except Merchandise.DoesNotExist:
            return Response({'error': 'Мерч не найден или недоступен'}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        quantity = request.data.get('quantity', 1)
        if quantity < 1:
            return Response({'error': 'Количество должно быть больше 0'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем наличие на складе
        if merchandise.stock_quantity < quantity:
            return Response({'error': f'Недостаточно товара на складе. Доступно: {merchandise.stock_quantity}'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        student_profile = request.user.student_profile
        total_cost = merchandise.points_cost * quantity
        
        # Проверяем, достаточно ли баллов
        if student_profile.points < total_cost:
            return Response({
                'error': 'Недостаточно баллов',
                'required': total_cost,
                'available': student_profile.points
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Создаем заказ
        order = MerchOrder.objects.create(
            student=request.user,
            merchandise=merchandise,
            quantity=quantity,
            points_spent=total_cost,
            delivery_address=request.data.get('delivery_address', ''),
            phone=request.data.get('phone', request.user.phone),
            notes=request.data.get('notes', '')
        )
        
        # Списываем баллы
        student_profile.points -= total_cost
        student_profile.save()
        
        # Уменьшаем количество на складе
        merchandise.stock_quantity -= quantity
        merchandise.save()
        
        # Создаем запись о транзакции
        PointTransaction.objects.create(
            student=request.user,
            points=-total_cost,
            transaction_type='SPENT',
            description=f"Покупка мерча: {merchandise.name} x{quantity}"
        )
        
        return Response({
            'order': MerchOrderSerializer(order).data,
            'remaining_points': student_profile.points,
            'message': 'Заказ успешно создан'
        }, status=status.HTTP_201_CREATED)

class MerchOrderListView(generics.ListAPIView):
    """Список заказов пользователя"""
    serializer_class = MerchOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Все пользователи видят свои заказы
        return MerchOrder.objects.filter(student=self.request.user)

class MerchOrderDetailView(generics.RetrieveAPIView):
    """Детали заказа"""
    serializer_class = MerchOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Все пользователи видят свои заказы
        return MerchOrder.objects.filter(student=self.request.user)
