import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Логіка авторизації тут...
    // Після авторизації перенаправляємо на головну сторінку
    navigate('/');
  };

  return (
    <div className="w-full h-screen items-center justify-center flex">
      <h1>Login Page</h1>
      <button onClick={handleLogin} className="p-2 bg-blue-500 text-white">
        Log In
      </button>
    </div>
  );
};

export default Login;
