import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/X5IDLogin.css";
import LoadingIndicator from "./LoadingIndicator";

function X5IDLogin({ onLogin }) {
    const [phone, setPhone] = useState("+7");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);
        setError(null);
        e.preventDefault();

        // Очищаем телефон от всех символов кроме цифр
        const phoneClean = phone.replace(/\D/g, '');
        
        if (!phoneClean || phoneClean.length < 10) {
            setError("Введите корректный номер телефона");
            setLoading(false);
            return;
        }

        try {
            // Отправляем только телефон
            const res = await api.post("/api/login/", { 
                phone: phone
            });
            
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            
            if (res.data.user) {
                localStorage.setItem("user", JSON.stringify(res.data.user));
                localStorage.setItem("userRole", res.data.user.user_type);
                if (onLogin) onLogin(res.data);
            }
            
            navigate("/");
        } catch (error) {
            console.error("Authentication error:", error);
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Ошибка при входе. Попробуйте еще раз.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        // Автоматически добавляем +7 если его нет
        if (!value.startsWith("+7")) {
            value = "+7" + value.replace(/\D/g, '');
        }
        // Ограничиваем длину
        if (value.length <= 12) {
            setPhone(value);
        }
    };

    return (
        <div className="x5id-wrapper">
            {/* Основная карточка */}
            <div className="x5id-card">
                {/* Логотип X5ID → X5Клуб */}
                <div className="x5id-logo">
                    <div className="x5id-logo-item">
                        <span className="x5id-leaf-icon">🍃</span>
                        <span className="x5id-text-black">X5ID</span>
                    </div>
                    <span className="x5id-arrow">→</span>
                    <div className="x5id-logo-item">
                        <span className="x5id-leaf-icon">🍃</span>
                        <span className="x5id-text-black">X5Клуб</span>
                    </div>
                </div>

                {/* Заголовок */}
                <h1 className="x5id-title">Авторизация X5ID</h1>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="x5id-form">
                    <label className="x5id-label">Введите номер телефона</label>
                    <input
                        className="x5id-phone-input"
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+7"
                        required
                        autoFocus
                    />

                    {error && <div className="x5id-error">{error}</div>}

                    {loading && <LoadingIndicator />}

                    <button 
                        className="x5id-submit-btn" 
                        type="submit" 
                        disabled={loading || phone.length < 12}
                    >
                        Подтвердить вход
                    </button>
                </form>
            </div>

            {/* Кнопка помощи внизу */}
            <button 
                className="x5id-help-btn"
                onClick={() => alert("Помощь по X5ID")}
            >
                Помощь X5ID
            </button>
        </div>
    );
}

export default X5IDLogin;

