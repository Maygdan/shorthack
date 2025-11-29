import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import { useNavigate } from 'react-router-dom';

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
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading-container">Loading analytics...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="analytics-container">
      <h1>Analytics Dashboard</h1>
      
      {analytics && (
        <>
          <div className="analytics-overview">
            <div className="stat-card">
              <h3>Total Events</h3>
              <p>{analytics.total_events}</p>
            </div>
            <div className="stat-card">
              <h3>Total Views</h3>
              <p>{analytics.total_views}</p>
            </div>
            <div className="stat-card">
              <h3>Total Completions</h3>
              <p>{analytics.total_completions}</p>
            </div>
            <div className="stat-card">
              <h3>Average Completion Rate</h3>
              <p>{analytics.average_completion_rate}</p>
            </div>
          </div>
          
          <h2>Recent Events</h2>
          <div className="events-list">
            {analytics.recent_events.map(event => (
              <div key={event.id} className="event-card">
                <h3>{event.title}</h3>
                <p>Type: {event.event_type}</p>
                <p>Views: {event.views_count}</p>
                <p>Completions: {event.completion_count}</p>
              </div>
            ))}
          </div>
        </>
      )}
      
      <button onClick={() => navigate('/')} className="btn">
        Return to Home
      </button>
    </div>
  );
}

export default Analytics;