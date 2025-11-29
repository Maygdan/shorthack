import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
<<<<<<< HEAD
=======
import "../styles/Global.css";
>>>>>>> eb86eb7c2ced0f65c8cf6c85700bda5d0984477e
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method, onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState(""); // Добавляем поле email для регистрации
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

<<<<<<< HEAD
    const name = method === "login" ? "Login" : "Register";
=======
    const name = method === "login" ? "Вход" : "Регистрация";
>>>>>>> eb86eb7c2ced0f65c8cf6c85700bda5d0984477e
    const isLogin = method === "login";

    const handleSubmit = async (e) => {
        setLoading(true);
        setError(null);
        e.preventDefault();

        try {
            let res;
            if (isLogin) {
                // Для логина отправляем только username и password
                res = await api.post(route, { username, password });
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                
                // Сохраняем информацию о пользователе
                if (res.data.user) {
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    // Сохраняем роль пользователя для отображения соответствующего интерфейса
                    localStorage.setItem("userRole", res.data.user.user_type);
                    
                    // Вызываем функцию обратного вызова при успешном логине
                    if (onLogin) onLogin(res.data);
                }
                
                navigate("/");
            } else {
                // Для регистрации отправляем username, password и email
                res = await api.post(route, { username, password, email });
                navigate("/login");
            }
        } catch (error) {
            console.error("Authentication error:", error);
            let errorMessage = "An error occurred. Please try again.";
            
            if (error.response) {
                // Обработка ошибок сервера
                if (error.response.data.username) {
                    errorMessage = "Username: " + error.response.data.username[0];
                } else if (error.response.data.password) {
                    errorMessage = "Password: " + error.response.data.password[0];
                } else if (error.response.data.email) {
                    errorMessage = "Email: " + error.response.data.email[0];
                } else if (error.response.data.non_field_errors) {
                    errorMessage = error.response.data.non_field_errors[0];
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                }
            } else if (error.request) {
                // Запрос был сделан, но ответ не был получен
                errorMessage = "No response from server. Please check your connection.";
            } else {
                // Ошибка при настройке запроса
                errorMessage = error.message || "Unknown error occurred";
            }
            
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
<<<<<<< HEAD
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            
            {!isLogin && (
                <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
            )}
            
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            
            {loading && <LoadingIndicator />}
            
            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Processing..." : name}
            </button>
            
            {!isLogin && (
                <p className="form-footer">
                    Already have an account? <button type="button" onClick={() => navigate('/login')} className="link-button">Login here</button>
                </p>
            )}
        </form>
=======
        <div className="form-wrapper">
            <div className="form-container">
                <div className="form-header">
                    <div className="form-logo">X5</div>
                    <h1 className="form-title">{name}</h1>
                    <p className="form-subtitle">
                        {isLogin 
                            ? "Войдите в свой аккаунт" 
                            : "Создайте новый аккаунт"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="form-body">
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">
                            Имя пользователя
                        </label>
                        <input
                            id="username"
                            className="form-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Введите имя пользователя"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Пароль
                        </label>
                        <input
                            id="password"
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                            required
                        />
                    </div>

                    {loading && <LoadingIndicator />}

                    <button 
                        className="form-button" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Загрузка..." : name}
                    </button>
                </form>

                <div className="form-footer">
                    {isLogin ? (
                        <p>
                            Нет аккаунта?{" "}
                            <Link to="/register">Зарегистрироваться</Link>
                        </p>
                    ) : (
                        <p>
                            Уже есть аккаунт?{" "}
                            <Link to="/login">Войти</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
>>>>>>> eb86eb7c2ced0f65c8cf6c85700bda5d0984477e
    );
}

export default Form;