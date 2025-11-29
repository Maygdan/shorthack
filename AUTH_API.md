# API Аутентификации

## Регистрация нового пользователя

**Endpoint:** `POST /api/register/`

**Запрос:**
```json
{
  "username": "student1",
  "email": "student1@example.com",
  "password": "securepassword123",
  "user_type": "STUDENT"  // или "MANAGER"
}
```

**Опциональные поля:**
- `phone`: номер телефона
- `university`: название университета
- `telegram_id`: ID пользователя в Telegram
- `interests`: интересы пользователя

**Успешный ответ (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "student1",
    "email": "student1@example.com",
    "user_type": "STUDENT",
    "phone": "",
    "university": "",
    "telegram_id": "",
    "interests": ""
  },
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ошибки:**
- 400 Bad Request - неверные данные (например, пользователь с таким именем уже существует)

---

## Вход в систему

**Endpoint:** `POST /api/login/`

**Запрос:**
```json
{
  "username": "student1",
  "password": "securepassword123"
}
```

**Успешный ответ (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "student1",
    "email": "student1@example.com",
    "user_type": "STUDENT",
    "phone": "",
    "university": "",
    "telegram_id": "",
    "interests": ""
  },
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ошибки:**
- 401 Unauthorized - неверные учетные данные
```json
{
  "error": "Invalid credentials"
}
```

---

## Использование токенов

### Access Token
- Используется для авторизации запросов к защищенным эндпоинтам
- Время жизни: 30 минут
- Добавляется в заголовок запроса:
  ```
  Authorization: Bearer <access_token>
  ```

### Refresh Token
- Используется для получения нового access token
- Время жизни: 1 день

---

## Типы пользователей

### STUDENT (Студент)
- Может просматривать активные мероприятия
- Может участвовать в мероприятиях
- Может оставлять отзывы
- Зарабатывает баллы за выполнение мероприятий
- Автоматически создается профиль `StudentProfile` с:
  - `points`: количество баллов (начальное значение: 0)
  - `last_activity`: время последней активности

### MANAGER (Менеджер)
- Может создавать мероприятия
- Может просматривать аналитику по своим мероприятиям
- Может редактировать и удалять свои мероприятия
- Автоматически создается профиль `ManagerProfile` с:
  - `company`: название компании (опционально)
  - `department`: отдел (опционально)

---

## Примеры использования

### Регистрация студента
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_student",
    "email": "john@university.edu",
    "password": "mypassword123",
    "user_type": "STUDENT",
    "university": "MIT",
    "interests": "Programming, AI, Games"
  }'
```

### Регистрация менеджера
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_manager",
    "email": "jane@x5.ru",
    "password": "securepass456",
    "user_type": "MANAGER"
  }'
```

### Вход в систему
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_student",
    "password": "mypassword123"
  }'
```

### Использование access token
```bash
curl -X GET http://localhost:8000/api/events/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Frontend интеграция

### Сохранение токенов
После успешной регистрации или входа:
```javascript
localStorage.setItem("access", response.data.access);
localStorage.setItem("refresh", response.data.refresh);
localStorage.setItem("user", JSON.stringify(response.data.user));
localStorage.setItem("userRole", response.data.user.user_type);
```

### Отправка запросов с токеном
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

---

## Безопасность

1. **Пароли** хешируются с использованием Django's PBKDF2
2. **JWT токены** подписываются секретным ключом
3. **Access токены** имеют короткий срок жизни (30 минут)
4. **Refresh токены** используются для получения новых access токенов
5. **CORS** настроен для разрешения запросов с frontend

---

## Требования к паролям

Django по умолчанию проверяет:
- Минимальная длина: 8 символов
- Не должен быть слишком похож на имя пользователя
- Не должен быть слишком простым
- Не должен состоять только из цифр

