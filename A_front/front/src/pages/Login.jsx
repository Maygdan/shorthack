<<<<<<< HEAD
import Form from "../components/Form";

function Login() {
  const handleLogin = (data) => {
    localStorage.setItem('userRole', data.user.user_type);
  };

  return <Form route="/api/login/" method="login" onLogin={handleLogin} />;
}

export default Login;

=======
import X5IDLogin from "../components/X5IDLogin";

function Login() {
  const handleLogin = (data) => {
    localStorage.setItem('userRole', data.user.user_type);
  };

  return <X5IDLogin onLogin={handleLogin} />;
}

export default Login;
>>>>>>> d7d4bf47d47b166099ac3326c84ba393c0b17f14
