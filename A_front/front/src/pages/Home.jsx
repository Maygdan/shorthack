import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/Global.css";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="home-wrapper">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-logo">X5</div>
          <nav className="home-nav">
            <a href="#features">Возможности</a>
            <a href="#about">О проекте</a>
            <button onClick={handleLogout} className="home-logout-btn">
              Выйти
            </button>
          </nav>
        </div>
      </header>

      {/* Hero секция */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-title">
            Добро пожаловать в <span className="highlight">X5</span>
          </h1>
          <p className="home-subtitle">
            Современная платформа для управления вашими проектами. 
            Создавайте, управляйте и развивайте свой бизнес с нами.
          </p>
          <div className="home-cta">
            <button className="btn btn-primary" onClick={() => alert('Начать работу')}>
              Начать работу
            </button>
            <button className="btn btn-secondary" onClick={() => alert('Узнать больше')}>
              Узнать больше
            </button>
          </div>
        </div>
      </section>

      {/* Возможности */}
      <section className="home-features" id="features">
        <div className="home-features-content">
          <h2 className="home-features-title">Наши возможности</h2>
          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon">🚀</div>
              <h3 className="home-feature-title">Быстрый старт</h3>
              <p className="home-feature-description">
                Начните работу за считанные минуты с интуитивным интерфейсом
                и простой настройкой.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">🔒</div>
              <h3 className="home-feature-title">Безопасность</h3>
              <p className="home-feature-description">
                Ваши данные защищены современными технологиями шифрования
                и аутентификации.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">📊</div>
              <h3 className="home-feature-title">Аналитика</h3>
              <p className="home-feature-description">
                Получайте детальную аналитику и отчеты для принятия
                обоснованных решений.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">⚡</div>
              <h3 className="home-feature-title">Производительность</h3>
              <p className="home-feature-description">
                Высокая скорость работы и оптимизация для любых устройств
                и платформ.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">🤝</div>
              <h3 className="home-feature-title">Командная работа</h3>
              <p className="home-feature-description">
                Эффективное взаимодействие в команде с удобными инструментами
                коллаборации.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">🎯</div>
              <h3 className="home-feature-title">Гибкость</h3>
              <p className="home-feature-description">
                Настраивайте систему под свои нужды с широкими возможностями
                кастомизации.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-content">
          <p>© 2025 X5. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;