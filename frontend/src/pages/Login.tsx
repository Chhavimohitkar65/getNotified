import React from 'react';
import Navbar from '../components/layout/Navbar';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <LoginForm />
      </main>
    </div>
  );
};

export default Login;