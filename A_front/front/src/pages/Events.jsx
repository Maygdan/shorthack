import React, { useState, useEffect } from 'react';
import { getEvents } from '../api';
import { useNavigate } from 'react-router-dom';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="loading-container">Loading events...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="events-container">
      <h1>Available Events</h1>
      
      {events.length === 0 ? (
        <p>No events available at the moment.</p>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <h2>{event.title}</h2>
              <p>{event.description.substring(0, 100)}...</p>
              <p>Type: {event.event_type}</p>
              <p>Points: {event.points}</p>
              <button 
                onClick={() => navigate(`/event/${event.id}`)}
                className="btn primary-btn"
              >
                Join Event
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;