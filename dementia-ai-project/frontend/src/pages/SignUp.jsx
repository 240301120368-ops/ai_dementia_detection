import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authAPI } from '../services/api';
import logo from '../assets/logo.jpg.png';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Detail, 2 = OTP
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useGSAP(() => {
    gsap.from(".signup-card", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" });
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters long.'); return; }

    setIsLoading(true);
    try {
      await authAPI.signup({ full_name: formData.full_name, email: formData.email, password: formData.password });
      setSuccess('Verification code sent to your email!');
      setStep(2);
      setIsLoading(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (otp.length !== 6) { setError('Please enter a valid 6-digit code.'); return; }

    setIsLoading(true);
    try {
      const response = await authAPI.verifySignupOTP(formData.email, otp);
      localStorage.setItem('access_token', response.data.access_token);
      setSuccess('Email verified! Redirecting to dashboard...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Invalid or expired code.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans selection:bg-lime-400 selection:text-black relative overflow-hidden px-4">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      <div className="signup-card bg-[#111] p-10 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 backdrop-blur-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logo} alt="Logo" className="w-16 h-16 rounded-xl mb-3 shadow-md object-cover" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {step === 1 ? 'Create Account' : 'Verify Email'}<span className="text-lime-400">.</span>
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            {step === 1 ? 'Join Early Dementia AI Assessment' : `We sent a code to ${formData.email}`}
          </p>
        </div>

        {error && <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-3 rounded-xl mb-5 text-sm font-medium">{error}</div>}
        {success && <div className="bg-lime-400/10 border border-lime-400/50 text-lime-400 p-3 rounded-xl mb-5 text-sm font-medium">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div className="signup-field">
              <label className="block text-sm font-medium text-white/80 mb-1">Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Dr. John Smith"
                className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-1 focus:ring-lime-400 focus:border-lime-400 outline-none transition-all bg-[#1a1a1a] text-white placeholder-white/30" required />
            </div>
            <div className="signup-field">
              <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="doctor@hospital.com"
                className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-1 focus:ring-lime-400 focus:border-lime-400 outline-none transition-all bg-[#1a1a1a] text-white placeholder-white/30" required />
            </div>
            <div className="signup-field">
              <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters"
                className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-1 focus:ring-lime-400 focus:border-lime-400 outline-none transition-all bg-[#1a1a1a] text-white placeholder-white/30" required />
            </div>
            <div className="signup-field">
              <label className="block text-sm font-medium text-white/80 mb-1">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password"
                className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-1 focus:ring-lime-400 focus:border-lime-400 outline-none transition-all bg-[#1a1a1a] text-white placeholder-white/30" required />
            </div>
            <button type="submit" disabled={isLoading}
              className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg ${
                isLoading ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-lime-400 hover:bg-lime-300 text-black shadow-lime-400/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}>
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="signup-field text-center">
              <label className="block text-sm font-medium text-white/80 mb-3">6-Digit Verification Code</label>
              <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000"
                className="w-full text-center text-3xl tracking-[1rem] font-mono px-4 py-4 border border-white/10 rounded-xl focus:ring-1 focus:ring-lime-400 focus:border-lime-400 outline-none transition-all bg-[#1a1a1a] text-white placeholder-white/10" required />
            </div>
            <button type="submit" disabled={isLoading}
              className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg ${
                isLoading ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-lime-400 hover:bg-lime-300 text-black shadow-lime-400/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}>
              {isLoading ? 'Verifying...' : 'Verify & Sign Up'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-white/30 hover:text-white/60 text-xs transition-colors">
              Did not get code? Change email or try again
            </button>
          </form>
        )}

        <div className="text-center mt-6 text-sm text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="text-lime-400 hover:text-lime-300 hover:underline font-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
