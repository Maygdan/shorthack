import React, { useState, useEffect } from 'react';
import { getMerchandise, purchaseMerchandise, getMerchOrders } from '../api';
import Navigation from '../components/Navigation';
import '../styles/MerchStore.css';

function MerchStore() {
  const [merchandise, setMerchandise] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [purchasing, setPurchasing] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedMerch, setSelectedMerch] = useState(null);
  const [purchaseData, setPurchaseData] = useState({
    quantity: 1,
    delivery_address: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [merchData, ordersData] = await Promise.all([
          getMerchandise(),
          getMerchOrders()
        ]);
        setMerchandise(merchData);
        setOrders(ordersData);
        
        // Получаем баллы пользователя из localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.student_profile) {
          setUserPoints(userData.student_profile.points || 0);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Обновляем баллы после покупки
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.student_profile) {
      setUserPoints(userData.student_profile.points || 0);
    }
  }, [orders]);

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

  const handlePurchaseClick = (merch) => {
    setSelectedMerch(merch);
    setPurchaseData({
      quantity: 1,
      delivery_address: '',
      phone: '',
      notes: ''
    });
    setShowPurchaseModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedMerch) return;
    
    setPurchasing(selectedMerch.id);
    try {
      const result = await purchaseMerchandise(selectedMerch.id, purchaseData);
      setUserPoints(result.remaining_points);
      
      // Обновляем данные пользователя в localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.student_profile) {
        userData.student_profile.points = result.remaining_points;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setShowPurchaseModal(false);
      setSelectedMerch(null);
      
      // Обновляем список мерча и заказов
      const [merchData, ordersData] = await Promise.all([
        getMerchandise(),
        getMerchOrders()
      ]);
      setMerchandise(merchData);
      setOrders(ordersData);
      
      alert('Заказ успешно создан!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Не удалось создать заказ';
      alert(errorMessage);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="merch-store-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка магазина...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="merch-store-container">
        <div className="error-message">
          <h3>Ошибка</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="merch-store-container">
        <div className="merch-store-header">
        <div className="header-content">
          <h1>Магазин мерча</h1>
          <div className="points-display">
            <span className="points-label">Ваши баллы:</span>
            <span className="points-value">{userPoints}</span>
          </div>
        </div>
        <p className="merch-store-subtitle">
          Обменивайте заработанные баллы на фирменный мерч X5
        </p>
      </div>

      {merchandise.length === 0 ? (
        <div className="merch-empty">
          <div className="merch-empty-icon">🛍️</div>
          <h3>Нет доступного мерча</h3>
          <p>В данный момент нет доступных товаров. Проверьте позже.</p>
        </div>
      ) : (
        <div className="merch-grid">
          {merchandise.map(merch => (
            <div key={merch.id} className="merch-card">
              <div className="merch-badge">
                {getMerchTypeLabel(merch.merch_type)}
              </div>
              
              {merch.image_url && (
                <div className="merch-image">
                  <img src={merch.image_url} alt={merch.name} />
                </div>
              )}
              
              <h2 className="merch-title">{merch.name}</h2>
              
              {merch.description && (
                <p className="merch-description">{merch.description}</p>
              )}
              
              <div className="merch-info">
                <div className="merch-stock">
                  {merch.stock_quantity > 0 ? (
                    <span className="stock-available">В наличии: {merch.stock_quantity}</span>
                  ) : (
                    <span className="stock-unavailable">Нет в наличии</span>
                  )}
                </div>
                
                <div className="merch-price">
                  <span className="price-value">{merch.points_cost}</span>
                  <span className="price-label">баллов</span>
                </div>
              </div>
              
              <button
                onClick={() => handlePurchaseClick(merch)}
                className="btn primary-btn"
                disabled={!merch.is_available || merch.stock_quantity === 0 || userPoints < merch.points_cost}
              >
                {merch.stock_quantity === 0 
                  ? 'Нет в наличии'
                  : userPoints < merch.points_cost
                  ? 'Недостаточно баллов'
                  : 'Купить'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно покупки */}
      {showPurchaseModal && selectedMerch && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Оформление заказа</h2>
            <div className="modal-merch-info">
              <h3>{selectedMerch.name}</h3>
              <p className="modal-price">{selectedMerch.points_cost} баллов</p>
            </div>
            
            <div className="form-group">
              <label>Количество:</label>
              <input
                type="number"
                min="1"
                max={selectedMerch.stock_quantity}
                value={purchaseData.quantity}
                onChange={(e) => setPurchaseData({
                  ...purchaseData,
                  quantity: parseInt(e.target.value) || 1
                })}
              />
              <p className="form-hint">
                Итого: {selectedMerch.points_cost * purchaseData.quantity} баллов
              </p>
            </div>
            
            <div className="form-group">
              <label>Адрес доставки:</label>
              <textarea
                value={purchaseData.delivery_address}
                onChange={(e) => setPurchaseData({
                  ...purchaseData,
                  delivery_address: e.target.value
                })}
                rows="3"
                placeholder="Введите адрес доставки"
              />
            </div>
            
            <div className="form-group">
              <label>Телефон:</label>
              <input
                type="tel"
                value={purchaseData.phone}
                onChange={(e) => setPurchaseData({
                  ...purchaseData,
                  phone: e.target.value
                })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            
            <div className="form-group">
              <label>Примечания (необязательно):</label>
              <textarea
                value={purchaseData.notes}
                onChange={(e) => setPurchaseData({
                  ...purchaseData,
                  notes: e.target.value
                })}
                rows="2"
                placeholder="Дополнительная информация"
              />
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPurchaseModal(false)}
              >
                Отмена
              </button>
              <button
                className="btn primary-btn"
                onClick={handlePurchase}
                disabled={purchasing === selectedMerch.id || purchaseData.quantity < 1 || !purchaseData.delivery_address}
              >
                {purchasing === selectedMerch.id ? 'Оформление...' : 'Оформить заказ'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default MerchStore;

