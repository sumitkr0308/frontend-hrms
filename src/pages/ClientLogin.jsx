// src/pages/ClientLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/hrms-logo1.png';

const ClientLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:4000/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Login failed.');

      if (data.accessToken) {
        localStorage.setItem('clientToken', data.accessToken);
        navigate('/client/dashboard');
      } else {
        throw new Error('Access token not found.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-purple-200 via-pink-200 to-indigo-200">
      {/* Logo */}
      <div className="absolute top-8">
        <Link to="/superadmin/login">
          <img
            src={logo}
            alt="HRMS Logo"
            className="w-36 h-20 mx-auto shadow-2xl object-cover rounded-full hover:scale-110 transform transition-transform duration-500"
          />
        </Link>
      </div>

      {/* Login Form */}
      <div className="mt-28 p-10 bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        <h1
          className="text-3xl font-extrabold text-center text-gray-900 mb-10 cursor-pointer hover:text-indigo-600 transition-colors duration-300"
          title="Super Admin Login Shortcut"
        >
          Client HRMS Portal
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <input
            type="email"
            placeholder="Company Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gradient-to-r focus:ring-indigo-500 focus:border-indigo-500 shadow-md transition-all duration-300"
            autoComplete="username"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gradient-to-r focus:ring-purple-500 focus:border-purple-500 shadow-md transition-all duration-300"
            autoComplete="current-password"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-xl hover:scale-105 transform transition-all duration-300"
          >
            Login
          </button>
        </form>

        {/* Alternate Login */}
        <div className="text-center mt-6">
          <Link
            to="/hr/login"
            className="text-sm text-gray-600 hover:text-purple-500 transition-colors duration-300"
          >
            Login as HR
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
