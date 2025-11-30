import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startEvent, submitQuiz, submitFeedback } from '../api';
import Navigation from '../components/Navigation';
import '../styles/Event.css';

function Event() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [minigameStarted, setMinigameStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await startEvent(id);
        setEvent(data);
        
        // Если это квиз, загружаем вопросы
        if (data.event_type === 'QUIZ') {
          setQuiz(data.quiz);
        }
      } catch (err) {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleAnswer = (questionId, answerId) => {
    const existingAnswerIndex = answers.findIndex(a => a.question_id === questionId);
    
    if (existingAnswerIndex !== -1) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { question_id: questionId, answer_id: answerId };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { question_id: questionId, answer_id: answerId }]);
    }
  };

  const submitQuizHandler = async () => {
    try {
      const result = await submitQuiz(id, answers);
      setQuizResult(result);
      setQuizCompleted(true);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Не удалось отправить квиз. Попробуйте позже.';
      alert(errorMessage);
    }
  };

  const submitFeedbackHandler = async () => {
    try {
      await submitFeedback(id, feedback);
      setFeedbackSubmitted(true);
      alert('Thank you for your feedback!');
    } catch (error) {
      alert('Error submitting feedback. Please try again.');
    }
  };

  const getEventTypeLabel = (type) => {
    const types = {
      'QUIZ': 'Квиз',
      'MINIGAME': 'Мини-игра',
      'QUEST': 'Квест',
      'PHOTO': 'Фото-челлендж'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="event-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка мероприятия...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="event-container">
          <div className="error-message">
            <h3>Ошибка</h3>
            <p>{error}</p>
            <button onClick={() => navigate('/events')} className="btn primary-btn">
              Вернуться к мероприятиям
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Navigation />
        <div className="event-container">
          <div className="error-message">
            <h3>Мероприятие не найдено</h3>
            <button onClick={() => navigate('/events')} className="btn primary-btn">
              Вернуться к мероприятиям
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="event-container">
        <div className="event-header">
          <div className="event-badge">
            {getEventTypeLabel(event.event_type)}
          </div>
          <h1>{event.title}</h1>
          <p className="event-description">{event.description}</p>
          <div className="event-meta">
            <div className="event-meta-item">
              <span>Тип: {getEventTypeLabel(event.event_type)}</span>
            </div>
            <div className="event-meta-item">
              <span>{event.points} баллов</span>
            </div>
          </div>
        </div>
      
      {event.event_type === 'QUIZ' && quiz && !quizCompleted && (
        <div className="quiz-container">
          <div className="quiz-progress">
            <div 
              className="quiz-progress-bar" 
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
          
          {currentQuestion < quiz.questions.length ? (
            <div className="question-container">
              <div className="question-number">
                Вопрос {currentQuestion + 1} из {quiz.questions.length}
              </div>
              <h3 className="question-text">{quiz.questions[currentQuestion].question_text}</h3>
              <div className="answers-container">
                {quiz.questions[currentQuestion].answers.map(answer => (
                  <button
                    key={answer.id}
                    className={`answer-btn ${answers.find(a => a.question_id === quiz.questions[currentQuestion].id && a.answer_id === answer.id) ? 'selected' : ''}`}
                    onClick={() => handleAnswer(quiz.questions[currentQuestion].id, answer.id)}
                  >
                    {answer.answer_text}
                  </button>
                ))}
              </div>
              <div className="quiz-controls">
                {currentQuestion > 0 && (
                  <button 
                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                    className="btn btn-secondary"
                  >
                    Назад
                  </button>
                )}
                {currentQuestion < quiz.questions.length - 1 ? (
                  <button 
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="btn primary-btn"
                    style={{ marginLeft: 'auto' }}
                  >
                    Далее
                  </button>
                ) : (
                  <button 
                    onClick={submitQuizHandler} 
                    className="btn primary-btn"
                    disabled={answers.length < quiz.questions.length}
                    style={{ marginLeft: 'auto' }}
                  >
                    Завершить квиз
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {quizCompleted && quizResult && (
        <div className="quiz-results">
          <h2>Квиз завершен!</h2>
          <div className="quiz-score">{quizResult.score}%</div>
          <p>
            Правильных ответов: {quizResult.correct_count} из {quizResult.total_questions}
          </p>
          {quizResult.passed ? (
            <div>
              <p style={{ color: 'var(--x5-green-dark)', fontWeight: 700, marginTop: 16 }}>
                ✓ Вы успешно прошли квиз!
              </p>
              <p style={{ marginTop: 8 }}>
                Вы заработали {event.points} баллов!
              </p>
              <p style={{ marginTop: 8, fontSize: 16 }}>
                Ваш текущий баланс: {quizResult.current_points} баллов
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--x5-red)', fontWeight: 700, marginTop: 16 }}>
              К сожалению, вы не прошли квиз. Попробуйте еще раз!
            </p>
          )}
        </div>
      )}
      
      {event.event_type === 'MINIGAME' && event.minigame && (
        <div className="minigame-container">
          {!minigameStarted ? (
            <div className="minigame-start">
              <h2>Мини-игра: {event.title}</h2>
              <p className="minigame-instructions">{event.minigame.instructions}</p>
              <button 
                onClick={() => setMinigameStarted(true)}
                className="btn primary-btn"
              >
                Начать игру
              </button>
            </div>
          ) : (
            <div className="minigame-content">
              <h2>Игра в процессе</h2>
              <p>Здесь будет реализация мини-игры</p>
              <p className="minigame-instructions">{event.minigame.instructions}</p>
            </div>
          )}
        </div>
      )}
      
      {quizCompleted && quizResult?.passed && !feedbackSubmitted && (
        <div className="feedback-container">
          <h3>Оставьте отзыв</h3>
          <p style={{ marginBottom: 24, color: 'var(--x5-gray)' }}>
            Поделитесь своими впечатлениями о мероприятии
          </p>
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star ${star <= feedback.rating ? 'filled' : ''}`}
                onClick={() => setFeedback({...feedback, rating: star})}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="feedback-textarea"
            placeholder="Ваш отзыв..."
            value={feedback.comment}
            onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
          />
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setFeedbackSubmitted(true)}
              className="btn btn-secondary"
            >
              Пропустить
            </button>
            <button 
              onClick={submitFeedbackHandler} 
              className="btn primary-btn"
            >
              Отправить отзыв
            </button>
          </div>
        </div>
      )}
      
      {feedbackSubmitted && (
        <div className="thank-you-container">
          <h2>Спасибо!</h2>
          <p>Ваш отзыв был отправлен.</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <button 
              onClick={() => navigate('/events')} 
              className="btn primary-btn"
            >
              К мероприятиям
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-secondary"
            >
              На главную
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Event;