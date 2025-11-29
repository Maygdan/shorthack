
import X5IDLogin from "../components/X5IDLogin";

function Login() {
  const handleLogin = (data) => {
    localStorage.setItem('userRole', data.user.user_type);
  };

  return <X5IDLogin onLogin={handleLogin} />;
}

export default Login;

