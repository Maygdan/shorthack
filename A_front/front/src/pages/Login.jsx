import Form from "../components/Form";

function Login() {
  const handleLogin = (data) => {
    localStorage.setItem('userRole', data.user.user_type);
  };

  return <Form route="/api/login/" method="login" onLogin={handleLogin} />;
}

export default Login;

