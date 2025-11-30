import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMerchandise } from '../api';
import Navigation from '../components/Navigation';
import '../styles/PointsSystem.css';

function PointsSystem() {
  const navigate = useNavigate();
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userPoints = user.student_profile?.points || 0;

  useEffect(() => {
    const fetchMerchandise = async () => {
      try {
        const data = await getMerchandise();
        setMerchandise(data.slice(0, 6)); // Показываем первые 6 товаров
      } catch (err) {
        console.error('Error fetching merchandise:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchandise();
  }, []);

  const getMerchTypeLabel = (type) => {
    const types = {
      'T_SHIRT': 'Футболка',
      'STICKER': 'Стикер',
      'HOODIE': 'Толстовка',
      'CAP': 'Кепка',
      'BAG': 'Сумка',
      'OTHER': 'Другое'
    };
    return types[type] || type;
  };

  return (
    <div>
      <Navigation />
      <div className="points-system-container">
        <div className="points-system-header">
          <h1>Система баллов</h1>
          <div className="points-display-large">
            <span className="points-label-large">Ваш баланс:</span>
            <span className="points-value-large">{userPoints}</span>
            <span className="points-unit">баллов</span>
          </div>
        </div>

        <div className="points-content">
          {/* Как зарабатывать баллы */}
          <section className="points-section">
            <h2>Как зарабатывать баллы</h2>
            <div className="earn-points-grid">
              <div className="earn-points-card">
                <div className="earn-icon">🎯</div>
                <h3>Прохождение квизов</h3>
                <p>
                  Участвуйте в квизах и получайте баллы за правильные ответы. 
                  Чем больше правильных ответов, тем больше баллов вы заработаете!
                </p>
                <div className="points-example">
                  <span className="points-amount">+10 до +50</span>
                  <span className="points-label-small">баллов за квиз</span>
                </div>
              </div>

              <div className="earn-points-card">
                <div className="earn-icon">🎮</div>
                <h3>Мини-игры</h3>
                <p>
                  Играйте в интерактивные мини-игры и развивайте свои навыки. 
                  За каждую пройденную игру вы получаете баллы!
                </p>
                <div className="points-example">
                  <span className="points-amount">+20 до +40</span>
                  <span className="points-label-small">баллов за игру</span>
                </div>
              </div>

              <div className="earn-points-card">
                <div className="earn-icon">🏆</div>
                <h3>Дополнительные задания</h3>
                <p>
                  Выполняйте специальные задания и квесты для получения бонусных баллов. 
                  Следите за новыми мероприятиями!
                </p>
                <div className="points-example">
                  <span className="points-amount">+30 до +100</span>
                  <span className="points-label-small">баллов за задание</span>
                </div>
              </div>
            </div>
          </section>

          {/* Что можно купить */}
          <section className="points-section">
            <h2>Что можно купить за баллы</h2>
            <p className="section-description">
              Обменивайте заработанные баллы на фирменный мерч X5. 
              Чем больше баллов вы накопите, тем больше выбор товаров!
            </p>
            
            {loading ? (
              <div className="loading-merch">
                <div className="loading-spinner"></div>
                <p>Загрузка товаров...</p>
              </div>
            ) : merchandise.length > 0 ? (
              <div className="merch-preview-grid">
                {merchandise.map(merch => (
                  <div key={merch.id} className="merch-preview-card">
                    <div className="merch-preview-badge">
                      {getMerchTypeLabel(merch.merch_type)}
                    </div>
                    <h4>{merch.name}</h4>
                    <div className="merch-preview-price">
                      <span className="price-value">{merch.points_cost}</span>
                      <span className="price-label">баллов</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-merch">
                <p>Товары скоро появятся в магазине</p>
              </div>
            )}

            <div className="view-store-btn">
              <button 
                onClick={() => navigate('/merch')}
                className="btn primary-btn btn-large"
              >
                Перейти в магазин мерча
              </button>
            </div>
          </section>

          {/* Кнопки действий */}
          <section className="points-section actions-section">
            <h2>Начните зарабатывать баллы</h2>
            <p className="section-description">
              Выберите тип мероприятия и начните свой путь к наградам!
            </p>
            
            <div className="action-buttons">
              <button 
                onClick={() => navigate('/events?type=QUIZ')}
                className="action-btn quiz-btn"
              >
                <div className="action-icon">🎯</div>
                <h3>Квизы</h3>
                <p>Проверьте свои знания и заработайте баллы</p>
                <span className="action-arrow">→</span>
              </button>

              <button 
                onClick={() => navigate('/events?type=MINIGAME')}
                className="action-btn minigame-btn"
              >
                <div className="action-icon">🎮</div>
                <h3>Мини-игры</h3>
                <p>Играйте и развивайтесь, получая баллы</p>
                <span className="action-arrow">→</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PointsSystem;

