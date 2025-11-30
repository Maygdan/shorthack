import React, { useState, useEffect } from 'react';
import { getEvents } from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import '../styles/Events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('type');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        if (err.response?.status === 401) {
          setError('Пожалуйста, войдите в систему для просмотра мероприятий');
        } else if (err.response?.status === 403) {
          setError('У вас нет доступа для просмотра мероприятий');
        } else {
          setError('Не удалось загрузить мероприятия. Пожалуйста, попробуйте позже.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Фильтрация событий по типу
  useEffect(() => {
    if (filterType) {
      const filtered = events.filter(event => event.event_type === filterType);
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [events, filterType]);

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
        <div className="events-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка мероприятий...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="events-container">
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
      <div className="events-container">
        <div className="events-header">
        <h1>
          {filterType === 'MINIGAME' ? 'Мини-игры' : 
           filterType === 'QUIZ' ? 'Квизы' :
           filterType === 'QUEST' ? 'Квесты' :
           filterType === 'PHOTO' ? 'Фото-челленджи' :
           'Доступные мероприятия'}
        </h1>
        <p className="events-subtitle">
          {filterType === 'MINIGAME' 
            ? 'Выберите мини-игру и начните зарабатывать баллы'
            : 'Выберите мероприятие и начните зарабатывать баллы'}
        </p>
      </div>
      
      {(filterType ? filteredEvents : events).length === 0 ? (
        <div className="events-empty">
          <div className="events-empty-icon">📅</div>
          <h3>Нет доступных мероприятий</h3>
          <p>В данный момент нет активных мероприятий. Проверьте позже.</p>
        </div>
      ) : (
        <div className="events-grid">
          {(filterType ? filteredEvents : events).map(event => (
            <div key={event.id} className="event-card">
              <div className="event-card-badge">
                {getEventTypeLabel(event.event_type)}
              </div>
              
              <h2 className="event-card-title">{event.title}</h2>
              
              <p className="event-card-description">
                {event.description && event.description.length > 120 
                  ? `${event.description.substring(0, 120)}...` 
                  : event.description || 'Описание отсутствует'}
              </p>
              
              <div className="event-card-meta">
                <div className="event-card-meta-item">
                  <span>Тип:</span>
                  <strong>{getEventTypeLabel(event.event_type)}</strong>
                </div>
              </div>
              
              <div className="event-card-points">
                <span className="points-value">{event.points}</span>
                <span className="points-label">баллов</span>
              </div>
              
              <button 
                onClick={() => navigate(`/event/${event.id}`)}
                className="btn primary-btn"
              >
                Участвовать
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default Events;