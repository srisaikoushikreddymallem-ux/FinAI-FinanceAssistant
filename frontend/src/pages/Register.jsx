
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Registration failed. Please try again.'
        );
      }

      navigate('/');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Wallet size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-800">
          Create Account
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-8">
          Start managing your finances smarter
        </p>

        <form onSubmit={handleRegister} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <div className="flex items-center border rounded-lg px-3">
              <User size={18} className="text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-3 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center border rounded-lg px-3">
              <Mail size={18} className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="flex items-center border rounded-lg px-3">
              <Lock size={18} className="text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full p-3 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {message && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 font-semibold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
