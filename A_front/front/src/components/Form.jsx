import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method, onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState(""); // Добавляем поле email для регистрации
    const [userType, setUserType] = useState("STUDENT"); // Добавляем выбор типа пользователя
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";
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
                // Для регистрации отправляем username, password, email и user_type
                res = await api.post(route, { 
                    username, 
                    password, 
                    email,
                    user_type: userType 
                });
                
                // После регистрации также сохраняем токены и логиним пользователя
                if (res.data.access && res.data.refresh) {
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                    
                    if (res.data.user) {
                        localStorage.setItem("user", JSON.stringify(res.data.user));
                        localStorage.setItem("userRole", res.data.user.user_type);
                    }
                    
                    navigate("/");
                } else {
                    // Если токены не вернулись, переходим на страницу логина
                    navigate("/login");
                }
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
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
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
            
            {!isLogin && (
                <select 
                    className="form-input"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                >
                    <option value="STUDENT">Student</option>
                    <option value="MANAGER">Manager</option>
                </select>
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
            
            {isLogin ? (
                <p className="form-footer">
                    Don't have an account? <button type="button" onClick={() => navigate('/register')} className="link-button">Register here</button>
                </p>
            ) : (
                <p className="form-footer">
                    Already have an account? <button type="button" onClick={() => navigate('/login')} className="link-button">Login here</button>
                </p>
            )}
        </form>
    );
}

export default Form;