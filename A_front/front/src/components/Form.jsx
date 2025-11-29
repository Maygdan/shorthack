import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import "../styles/Global.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Вход" : "Регистрация";
    const isLogin = method === "login";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password })
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/")
            } else {
                navigate("/login")
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    };

    return (
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
    );
}

export default Form