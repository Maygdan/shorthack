import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import '../styles/Analytics.css';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Не удалось загрузить аналитику');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="analytics-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка аналитики...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="analytics-container">
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
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Аналитика</h1>
          <p>Детальная статистика по вашим мероприятиям</p>
        </div>
      
        {analytics && (
          <>
            {/* Основные метрики */}
            <div className="analytics-overview">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-label">Всего мероприятий</div>
                <div className="stat-value">{analytics.total_events}</div>
                <div className="stat-description">Созданных мероприятий</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">👁️</div>
                <div className="stat-label">Всего просмотров</div>
                <div className="stat-value">{analytics.total_views}</div>
                <div className="stat-description">Просмотров мероприятий</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-label">Завершений</div>
                <div className="stat-value">{analytics.total_completions}</div>
                <div className="stat-description">Успешно завершено</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-label">Процент завершения</div>
                <div className="stat-value">{analytics.average_completion_rate}</div>
                <div className="stat-description">Средний показатель</div>
              </div>
            </div>

            {/* Метрики по квизам */}
            <div className="analytics-section">
              <h2 className="analytics-section-title">Статистика по квизам</h2>
              <div className="analytics-overview">
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-label">Всего пройдено квизов</div>
                  <div className="stat-value">{analytics.total_quiz_attempts || 0}</div>
                  <div className="stat-description">Общее количество попыток</div>
                </div>
                
                <div className="stat-card" style={{ borderColor: 'var(--x5-green)' }}>
                  <div className="stat-icon">✓</div>
                  <div className="stat-label">Пройдено успешно</div>
                  <div className="stat-value" style={{ color: 'var(--x5-green-dark)' }}>
                    {analytics.successful_quiz_attempts || 0}
                  </div>
                  <div className="stat-description">С проходным баллом</div>
                </div>
                
                <div className="stat-card" style={{ borderColor: 'var(--x5-red)' }}>
                  <div className="stat-icon">✗</div>
                  <div className="stat-label">Пройдено неудачно</div>
                  <div className="stat-value" style={{ 
                    background: 'linear-gradient(135deg, var(--x5-red) 0%, #C62828 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {analytics.failed_quiz_attempts || 0}
                  </div>
                  <div className="stat-description">Не прошли порог</div>
                </div>
              </div>
            </div>

            {/* Метрики по пользователям */}
            <div className="analytics-section">
              <h2 className="analytics-section-title">Пользователи</h2>
              <div className="analytics-overview">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-label">Всего студентов</div>
                  <div className="stat-value">{analytics.total_students || 0}</div>
                  <div className="stat-description">Зарегистрировано в системе</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🎮</div>
                  <div className="stat-label">Участвовали</div>
                  <div className="stat-value">{analytics.students_participated || 0}</div>
                  <div className="stat-description">В ваших мероприятиях</div>
                </div>
              </div>
            </div>
          
            {/* Последние мероприятия */}
            {analytics.recent_events && analytics.recent_events.length > 0 && (
              <div className="analytics-section">
                <h2 className="analytics-section-title">Последние мероприятия</h2>
                <div className="events-list">
                  {analytics.recent_events.map(event => (
                    <div key={event.id} className="event-card">
                      <h3>{event.title}</h3>
                      <div className="event-stats">
                        <div className="event-stat-item">
                          <div className="event-stat-label">Тип</div>
                          <div className="event-stat-value" style={{ fontSize: '16px' }}>
                            {event.event_type === 'QUIZ' ? 'Квиз' : 
                             event.event_type === 'MINIGAME' ? 'Мини-игра' : 
                             event.event_type === 'QUEST' ? 'Квест' : 
                             event.event_type === 'PHOTO' ? 'Фото-челлендж' : event.event_type}
                          </div>
                        </div>
                        <div className="event-stat-item">
                          <div className="event-stat-label">Просмотры</div>
                          <div className="event-stat-value">{event.views_count}</div>
                        </div>
                        <div className="event-stat-item">
                          <div className="event-stat-label">Завершения</div>
                          <div className="event-stat-value">{event.completion_count}</div>
                        </div>
                        <div className="event-stat-item">
                          <div className="event-stat-label">Баллы</div>
                          <div className="event-stat-value">{event.points}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;