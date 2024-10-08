import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="w-full h-screen items-center justify-center flex">
      <h1>Home Page</h1>
      <Link to="/login">Go to Login</Link>
      <Link to="/settings" className="ml-4">Go to Settings</Link>
    </div>
  );
};

export default Home;
