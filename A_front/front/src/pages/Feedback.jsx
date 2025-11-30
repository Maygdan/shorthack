import React, { useState, useEffect } from 'react';
import { getCompletedEvents, submitFeedback, getMyFeedbacks } from '../api';
import Navigation from '../components/Navigation';
import '../styles/Feedback.css';

function Feedback() {
  const [completedEvents, setCompletedEvents] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, feedbacksData] = await Promise.all([
          getCompletedEvents(),
          getMyFeedbacks()
        ]);
        setCompletedEvents(eventsData.events || []);
        setMyFeedbacks(feedbacksData.feedbacks || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setFeedbackData({ rating: 5, comment: '' });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);
    try {
      await submitFeedback(selectedEvent.id, feedbackData);
      setSuccess(true);
      setSelectedEvent(null);
      setFeedbackData({ rating: 5, comment: '' });
      
      // Обновляем данные
      const [eventsData, feedbacksData] = await Promise.all([
        getCompletedEvents(),
        getMyFeedbacks()
      ]);
      setCompletedEvents(eventsData.events || []);
      setMyFeedbacks(feedbacksData.feedbacks || []);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Не удалось отправить отзыв';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="feedback-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="feedback-container">
          <div className="error-message">
            <h3>Ошибка</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="feedback-container">
        <div className="feedback-header">
          <h1>Обратная связь</h1>
          <p className="feedback-subtitle">
            Поделитесь своим мнением о пройденных мероприятиях
          </p>
        </div>

        {success && (
          <div className="success-message">
            <span>✓</span> Отзыв успешно отправлен!
          </div>
        )}

        <div className="feedback-content">
          <div className="feedback-section">
            <h2>Оставить отзыв</h2>
            
            {completedEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>Нет завершенных мероприятий</h3>
                <p>Завершите мероприятия, чтобы оставить отзыв</p>
              </div>
            ) : (
              <>
                <div className="events-list">
                  <h3>Выберите мероприятие:</h3>
                  <div className="events-grid">
                    {completedEvents.map(event => (
                      <div
                        key={event.id}
                        className={`event-card ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                        onClick={() => handleEventSelect(event)}
                      >
                        <h4>{event.title}</h4>
                        <p className="event-type">{event.event_type === 'QUIZ' ? 'Квиз' : 
                          event.event_type === 'MINIGAME' ? 'Мини-игра' : 
                          event.event_type === 'QUEST' ? 'Квест' : 
                          event.event_type === 'PHOTO' ? 'Фото-челлендж' : event.event_type}</p>
                        <p className="event-points">{event.points} баллов</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEvent && (
                  <form className="feedback-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Оценка:</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            className={`rating-star ${feedbackData.rating >= rating ? 'active' : ''}`}
                            onClick={() => setFeedbackData({ ...feedbackData, rating })}
                          >
                            ⭐
                          </button>
                        ))}
                        <span className="rating-value">{feedbackData.rating} / 5</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Комментарий:</label>
                      <textarea
                        value={feedbackData.comment}
                        onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                        rows="6"
                        placeholder="Поделитесь своими впечатлениями..."
                        className="feedback-textarea"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedEvent(null);
                          setFeedbackData({ rating: 5, comment: '' });
                        }}
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="btn primary-btn"
                        disabled={submitting}
                      >
                        {submitting ? 'Отправка...' : 'Отправить отзыв'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          {myFeedbacks.length > 0 && (
            <div className="feedback-section">
              <h2>Мои отзывы</h2>
              <div className="feedbacks-list">
                {myFeedbacks.map(feedback => (
                  <div key={feedback.id} className="feedback-item">
                    <div className="feedback-item-header">
                      <h4>{feedback.event?.title || 'Мероприятие'}</h4>
                      <div className="feedback-rating">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <span
                            key={rating}
                            className={feedback.rating >= rating ? 'star-filled' : 'star-empty'}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    {feedback.comment && (
                      <p className="feedback-comment">{feedback.comment}</p>
                    )}
                    <p className="feedback-date">
                      {new Date(feedback.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Feedback;

