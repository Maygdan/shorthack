from rest_framework import serializers
from .models import CustomUser, StudentProfile, ManagerProfile, Event, Quiz, QuizQuestion, QuizAnswer
from .models import Minigame, EventParticipation, Feedback, PointTransaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'user_type', 'phone', 'university', 'telegram_id', 'interests']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        phone = validated_data.get('phone', '').strip()
        # Очищаем телефон от всех символов кроме цифр
        phone_clean = ''.join(filter(str.isdigit, phone))
        if phone_clean.startswith('7') or phone_clean.startswith('8'):
            phone_clean = phone_clean[1:]
        
        # Генерируем username из телефона, если не указан
        username = validated_data.get('username') or f"user_{phone_clean}"
        
        user = CustomUser.objects.create_user(
            username=username,
            email=validated_data.get('email', f"{username}@x5.ru"),
            password=validated_data.get('password', None),
            user_type=validated_data.get('user_type', 'STUDENT'),
            phone=phone_clean,
            university=validated_data.get('university', ''),
            telegram_id=validated_data.get('telegram_id', ''),
            interests=validated_data.get('interests', '')
        )
        # Устанавливаем unusable password, если пароль не указан
        if not validated_data.get('password'):
            user.set_unusable_password()
            user.save()
        return user

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'points', 'last_activity']

class ManagerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ManagerProfile
        fields = ['id', 'user', 'company', 'department']

class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['id', 'answer_text', 'is_correct']

class QuizQuestionSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'order', 'answers']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'time_limit', 'passing_score', 'questions']

class MinigameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Minigame
        fields = ['id', 'game_type', 'instructions']

class EventSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    minigame = MinigameSerializer(read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'event_type', 'points', 'is_active', 'qr_code', 
                 'views_count', 'completion_count', 'created_at', 'updated_at', 'quiz', 'minigame']

class EventParticipationSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    
    class Meta:
        model = EventParticipation
        fields = ['id', 'event', 'completed', 'score', 'completed_at', 'first_viewed']

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'rating', 'comment', 'created_at']

class PointTransactionSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    
    class Meta:
        model = PointTransaction
        fields = ['id', 'points', 'transaction_type', 'description', 'timestamp', 'event']