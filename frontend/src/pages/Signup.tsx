import React from 'react';
import Navbar from '../components/layout/Navbar';
import SignupForm from '../components/auth/SignupForm';

const Signup = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <SignupForm />
      </main>
    </div>
  );
};

export default Signup;