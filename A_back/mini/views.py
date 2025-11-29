from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db import models
from .models import CustomUser, Event, Quiz, QuizQuestion, QuizAnswer, EventParticipation, Feedback, Minigame, PointTransaction
from .serializers import UserSerializer, EventSerializer, QuizSerializer, FeedbackSerializer, MinigameSerializer
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
        
        # Ищем пользователя по телефону
        try:
            user = CustomUser.objects.get(phone__endswith=phone_clean)
        except CustomUser.DoesNotExist:
            # Если пользователь не найден, создаем нового студента
            # В реальной системе здесь была бы отправка SMS-кода
            username = f"user_{phone_clean}"
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
        except CustomUser.MultipleObjectsReturned:
            # Если найдено несколько пользователей, берем первого
            user = CustomUser.objects.filter(phone__endswith=phone_clean).first()
        
        # Генерируем токены
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class EventListView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Менеджеры видят только свои мероприятия, студенты видят активные
        if self.request.user.user_type == 'MANAGER':
            return Event.objects.filter(manager=self.request.user)
        return Event.objects.filter(is_active=True)

    def perform_create(self, serializer):
        # Только менеджеры могут создавать мероприятия
        if self.request.user.user_type != 'MANAGER':
            raise permissions.PermissionDenied("Only managers can create events")
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
        
        # Создаем запись о просмотре, если это студент
        if request.user.user_type == 'STUDENT':
            EventParticipation.objects.get_or_create(
                event=event,
                student=request.user,
                defaults={'first_viewed': timezone.now()}
            )
        
        return super().get(request, *args, **kwargs)

class StartEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, event_id):
        if request.user.user_type != 'STUDENT':
            return Response({'error': 'Only students can participate in events'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
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
        if request.user.user_type != 'STUDENT':
            return Response({'error': 'Only students can submit quiz answers'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
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
        if request.user.user_type != 'STUDENT':
            return Response({'error': 'Only students can provide feedback'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
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

class ManagerAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, event_id=None):
        if request.user.user_type != 'MANAGER':
            return Response({'error': 'Only managers can access analytics'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        if event_id:
            # Аналитика по конкретному мероприятию
            try:
                event = Event.objects.get(id=event_id, manager=request.user)
            except Event.DoesNotExist:
                return Response({'error': 'Event not found or you are not the manager'}, 
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
        events = Event.objects.filter(manager=request.user)
        total_events = events.count()
        total_views = events.aggregate(models.Sum('views_count'))['views_count__sum'] or 0
        total_completions = events.aggregate(models.Sum('completion_count'))['completion_count__sum'] or 0
        
        return Response({
            'total_events': total_events,
            'total_views': total_views,
            'total_completions': total_completions,
            'average_completion_rate': f"{(total_completions / total_views * 100):.1f}%" if total_views > 0 else "0%",
            'recent_events': EventSerializer(events.order_by('-created_at')[:5], many=True).data
        })