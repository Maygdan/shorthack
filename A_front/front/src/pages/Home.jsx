import React from 'react';
import { useNavigate } from 'react-router-dom';
import X5Logo from '../components/X5Logo';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="home-wrapper">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <X5Logo size="medium" />
          <nav className="home-nav">
            {userRole === 'STUDENT' && (
              <>
                <a href="/events">Мероприятия</a>
                <a href="/merch">Магазин мерча</a>
              </>
            )}
            {userRole === 'MANAGER' && (
              <a href="/analytics">Аналитика</a>
            )}
            <button onClick={handleLogout} className="home-logout-btn">
              Выход
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-title">
            Добро пожаловать в <span className="highlight">X5</span>
          </h1>
          <p className="home-subtitle">
            {user.username ? `Привет, ${user.username}! ` : ''}
            Платформа для интерактивных мероприятий, квизов и обучения. 
            Развивайтесь вместе с нами!
          </p>
          <div className="home-cta">
            {userRole === 'STUDENT' ? (
              <>
                <button onClick={() => navigate('/events')} className="btn btn-primary btn-large">
                  Перейти к мероприятиям
                </button>
                <button onClick={() => navigate('/events')} className="btn btn-secondary btn-large">
                  Мой профиль
                </button>
              </>
            ) : userRole === 'MANAGER' ? (
              <>
                <button onClick={() => navigate('/analytics')} className="btn btn-primary btn-large">
                  Аналитика
                </button>
                <button onClick={() => navigate('/events')} className="btn btn-secondary btn-large">
                  Мероприятия
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/events')} className="btn btn-primary btn-large">
                  Я студент
                </button>
                <button onClick={() => navigate('/analytics')} className="btn btn-secondary btn-large">
                  Я менеджер
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="home-features-content">
          <h2 className="home-features-title">Возможности платформы</h2>
          <p className="home-features-subtitle">
            Все инструменты для эффективного обучения и развития в одном месте
          </p>
          
          <div className="home-features-grid">
            <div 
              className="home-feature-card" 
              onClick={() => navigate('/events?type=QUIZ')}
              style={{ cursor: 'pointer' }}
            >
              <div className="home-feature-icon">🎯</div>
              <h3 className="home-feature-title">Интерактивные квизы</h3>
              <p className="home-feature-description">
                Проверяйте свои знания с помощью увлекательных квизов и получайте мгновенную обратную связь
              </p>
            </div>

            <div 
              className="home-feature-card" 
              onClick={() => navigate('/events?type=MINIGAME')}
              style={{ cursor: 'pointer' }}
            >
              <div className="home-feature-icon">🎮</div>
              <h3 className="home-feature-title">Мини-игры</h3>
              <p className="home-feature-description">
                Обучайтесь через игру! Интерактивные мини-игры делают процесс обучения веселым и эффективным
              </p>
            </div>

            <div 
              className="home-feature-card" 
              onClick={() => navigate('/points')}
              style={{ cursor: 'pointer' }}
            >
              <div className="home-feature-icon">⭐</div>
              <h3 className="home-feature-title">Система баллов</h3>
              <p className="home-feature-description">
                Зарабатывайте баллы за выполнение заданий и отслеживайте свой прогресс
              </p>
            </div>

            <div 
              className="home-feature-card" 
              onClick={() => navigate('/analytics')}
              style={{ cursor: 'pointer' }}
            >
              <div className="home-feature-icon">📊</div>
              <h3 className="home-feature-title">Аналитика</h3>
              <p className="home-feature-description">
                Для менеджеров: детальная аналитика по всем мероприятиям и участникам
              </p>
            </div>

            <div 
              className="home-feature-card" 
              onClick={() => navigate('/feedback')}
              style={{ cursor: 'pointer' }}
            >
              <div className="home-feature-icon">💬</div>
              <h3 className="home-feature-title">Обратная связь</h3>
              <p className="home-feature-description">
                Оставляйте отзывы и помогайте улучшать качество мероприятий
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">📱</div>
              <h3 className="home-feature-title">QR-коды</h3>
              <p className="home-feature-description">
                Быстрый доступ к мероприятиям через QR-коды для максимального удобства
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-content">
          <div className="home-footer-logo">
            <X5Logo size="medium" color="green" />
          </div>
          <p>© 2025 X5. Все права защищены.</p>
          <div className="home-footer-links">
            <a href="#">О компании</a>
            <a href="#">Конфиденциальность</a>
            <a href="#">Условия использования</a>
            <a href="#">Поддержка</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;