import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import X5Logo from './X5Logo';
import '../styles/Navigation.css';

function Navigation() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userPoints = user.student_profile?.points || 0;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="navigation-header">
      <div className="navigation-content">
        <Link to="/" className="navigation-logo">
          <X5Logo size="medium" />
        </Link>
        <nav className="navigation-nav">
          <Link to="/events">Мероприятия</Link>
          <Link to="/merch">Магазин мерча</Link>
          <Link to="/analytics">Аналитика</Link>
          {userPoints > 0 && (
            <span className="navigation-points">
              {userPoints} баллов
            </span>
          )}
          <button onClick={handleLogout} className="navigation-logout-btn">
            Выход
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navigation;

