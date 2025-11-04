import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/hrms-logo1.png'; 
import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Input = ({ id, label, icon: Icon, ...props }) => (
    <div>
        <label htmlFor={id} className="sr-only">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <input id={id} className="w-full px-5 py-3 pl-12 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400 transition-all" {...props} />
        </div>
    </div>
);

const HRLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // This check is simple and doesn't know the role, which is fine for a basic redirect.
        if (localStorage.getItem('hrToken')) {
            const user = JSON.parse(localStorage.getItem('hrUser'));
            if (user?.role === 'Manager') {
                navigate('/manager/dashboard');
            } else {
                navigate('/hr/dashboard');
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/hr/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed!');
            }

            localStorage.setItem('hrToken', data.accessToken);
            localStorage.setItem('hrUser', JSON.stringify(data.user));

            // --- THE FIX IS HERE ---
            // Check the user's role from the API response and navigate accordingly.
            if (data.user.role === 'Manager') {
                navigate('/manager/dashboard');
            } else { // Assumes any other role is a Recruiter
                navigate('/hr/dashboard');
            }
            // ---------------------

        } catch (err) {
            setError(err.message || 'Invalid HR credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
            <div className="relative w-full max-w-md m-4">
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-full  shadow-2xl">
                    <img src={logo} alt="HRMS Logo" className="w-28 h-28 object-cover  rounded-full" />
                </div>
                <div className="mt-16 p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl">
                    <h1 className="text-4xl font-extrabold text-center text-indigo-900 mb-8">HR Portal Login</h1>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input id="email" label="Email" type="email" icon={AtSymbolIcon} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hr@example.com" required />
                        <Input id="password" label="Password" type="password" icon={KeyIcon} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                        {error && <p className="text-red-600 text-sm text-center font-semibold">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg disabled:opacity-70 disabled:scale-100">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <Link to="/" className="text-sm text-indigo-800 hover:text-pink-600 font-semibold transition-colors">
                            &larr; Not an HR? Back to Home Page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRLogin;