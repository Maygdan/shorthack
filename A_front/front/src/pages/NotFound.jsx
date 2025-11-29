import { Link } from "react-router-dom";
import "../styles/NotFound.css";
import "../styles/Global.css";

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-logo">X5</div>
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">
          Упс! Страница, которую вы ищете, не существует.
        </p>
        <Link to="/" className="not-found-btn">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

export default NotFound;