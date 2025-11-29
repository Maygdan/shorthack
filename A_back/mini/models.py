from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

# Кастомная модель пользователя с типом
class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('STUDENT', 'Student'),
        ('MANAGER', 'Manager'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='STUDENT')
    phone = models.CharField(max_length=20, unique=True)
    university = models.CharField(max_length=255, blank=True, null=True)
    telegram_id = models.CharField(max_length=50, blank=True, null=True)
    interests = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

# Профиль студента
class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    points = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile of {self.user.username}"

# Профиль менеджера
class ManagerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='manager_profile')
    company = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"Manager: {self.user.username}"

# Сигналы для автоматического создания профилей
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.user_type == 'STUDENT':
            StudentProfile.objects.get_or_create(user=instance)
        elif instance.user_type == 'MANAGER':
            ManagerProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, created, **kwargs):
    if not created:  # Только если пользователь уже существует
        try:
            if instance.user_type == 'STUDENT' and hasattr(instance, 'student_profile'):
                instance.student_profile.save()
            elif instance.user_type == 'MANAGER' and hasattr(instance, 'manager_profile'):
                instance.manager_profile.save()
        except (StudentProfile.DoesNotExist, ManagerProfile.DoesNotExist):
            pass

# Событие/мероприятие
class Event(models.Model):
    EVENT_TYPE_CHOICES = (
        ('QUIZ', 'Quiz'),
        ('MINIGAME', 'Minigame'),
        ('QUEST', 'Quest'),
        ('PHOTO', 'Photo Challenge'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default='QUIZ')
    manager = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='events')
    points = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    qr_code = models.CharField(max_length=255, blank=True, null=True)
    views_count = models.IntegerField(default=0)
    completion_count = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.title} ({self.get_event_type_display()})"

# Квиз
class Quiz(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='quiz')
    time_limit = models.IntegerField(default=300)  # в секундах
    passing_score = models.IntegerField(default=70)  # процент
    
    def __str__(self):
        return f"Quiz: {self.event.title}"

# Вопрос для квиза
class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."

# Вариант ответа для квиза
class QuizAnswer(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Answer: {self.answer_text[:50]}..."

# Мини-игра
class Minigame(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='minigame')
    game_type = models.CharField(max_length=50, default='simple')
    instructions = models.TextField()
    
    def __str__(self):
        return f"Minigame: {self.event.title}"

# Участие в мероприятии
class EventParticipation(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='participations')
    completed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    first_viewed = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('event', 'student')
    
    def __str__(self):
        return f"{self.student.username} - {self.event.title}"

# Обратная связь
class Feedback(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedbacks')
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(default=5)  # от 1 до 5
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Feedback for {self.event.title} by {self.student.username}"

# Система баллов
class PointTransaction(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='points_history')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)
    points = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=(
        ('EARNED', 'Earned'),
        ('SPENT', 'Spent'),
        ('BONUS', 'Bonus'),
    ))
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.username}: {self.points} points"

# Мерч (товары, которые можно купить за баллы)
class Merchandise(models.Model):
    MERCH_TYPE_CHOICES = (
        ('T_SHIRT', 'Футболка'),
        ('STICKER', 'Стикер'),
        ('HOODIE', 'Толстовка'),
        ('CAP', 'Кепка'),
        ('BAG', 'Сумка'),
        ('OTHER', 'Другое'),
    )
    
    name = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(verbose_name='Описание', blank=True, null=True)
    merch_type = models.CharField(max_length=20, choices=MERCH_TYPE_CHOICES, default='OTHER', verbose_name='Тип мерча')
    points_cost = models.IntegerField(verbose_name='Стоимость в баллах')
    image_url = models.URLField(blank=True, null=True, verbose_name='URL изображения')
    is_available = models.BooleanField(default=True, verbose_name='Доступен')
    stock_quantity = models.IntegerField(default=0, verbose_name='Количество на складе')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Мерч'
        verbose_name_plural = 'Мерч'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.points_cost} баллов)"

# Заказ мерча
class MerchOrder(models.Model):
    ORDER_STATUS_CHOICES = (
        ('PENDING', 'Ожидает обработки'),
        ('PROCESSING', 'В обработке'),
        ('SHIPPED', 'Отправлен'),
        ('DELIVERED', 'Доставлен'),
        ('CANCELLED', 'Отменен'),
    )
    
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='merch_orders', verbose_name='Студент')
    merchandise = models.ForeignKey(Merchandise, on_delete=models.CASCADE, related_name='orders', verbose_name='Мерч')
    quantity = models.IntegerField(default=1, verbose_name='Количество')
    points_spent = models.IntegerField(verbose_name='Потрачено баллов')
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='PENDING', verbose_name='Статус')
    delivery_address = models.TextField(blank=True, null=True, verbose_name='Адрес доставки')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Телефон')
    notes = models.TextField(blank=True, null=True, verbose_name='Примечания')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Заказ мерча'
        verbose_name_plural = 'Заказы мерча'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Заказ #{self.id} - {self.student.username} - {self.merchandise.name}"