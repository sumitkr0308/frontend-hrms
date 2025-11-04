import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('superAdminToken');
    if (token) navigate('/superadmin/dashboard');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed!');
      const { accessToken } = await response.json();

      localStorage.setItem('superAdminToken', accessToken);
      navigate('/superadmin/dashboard');
    } catch (err) {
      setError('Invalid Super Admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Super Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full bg-gray-700 p-3 rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full bg-gray-700 p-3 rounded"
            autoComplete="current-password"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded font-bold ${
              loading ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Logging in...' : 'Login as Super Admin'}
          </button>
        </form>
        <div className="text-center mt-6">
          <Link to="/client/login" className="text-sm text-gray-400 hover:text-white">
            &larr; Back to Client Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
