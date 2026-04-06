import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authAPI } from '../services/api';
import logo from '../assets/logo.jpg.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef();

  useGSAP(() => {
    gsap.from(cardRef.current, { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" });
    gsap.from(".login-field", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.3 });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem('access_token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Invalid credentials. Please check your email and password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans selection:bg-lime-400 selection:text-black relative overflow-hidden px-4">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      <div ref={cardRef} className="bg-[#111] p-10 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 backdrop-blur-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logo} alt="Logo" className="w-16 h-16 rounded-xl mb-3 shadow-md object-cover" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back<span className="text-lime-400">.</span></h1>
          <p className="text-white/50 mt-2 text-sm">Sign in to Early Dementia AI</p>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-3 rounded-xl mb-5 text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="login-field">
            <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-1 focus:ring-lime-400 focus:border-lime-400 outline-none transition-all bg-[#1a1a1a] text-white placeholder-white/30" required />
          </div>
          <div className="login-field">
            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
              className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-1 focus:ring-lime-400 focus:border-lime-400 outline-none transition-all bg-[#1a1a1a] text-white placeholder-white/30" required />
          </div>
          <div className="login-field">
            <button type="submit" disabled={isLoading}
              className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg ${
                isLoading ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-lime-400 hover:bg-lime-300 text-black shadow-lime-400/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-white/50">
            Don't have an account?{' '}
            <Link to="/signup" className="text-lime-400 hover:text-lime-300 hover:underline font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
