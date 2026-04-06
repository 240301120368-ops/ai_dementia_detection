import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authAPI } from '../services/api';
import logo from '../assets/logo.jpg.png';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef();

  useEffect(() => {
    // We don't have a dedicated /me endpoint right now, but we can verify auth 
    // and ideally we'd get the user info. For now we will rely on local storage 
    // or simulate it if the backend doesn't return full user info.
    // In a real app we'd call a /users/me endpoint. For now, since they are logged in if they have a token,
    // we will simulate fetching their profile if they have a token.
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Simulate user fetch (in future bind to real backend /me endpoint)
    setTimeout(() => {
      setUser({
        full_name: "Test Patient",
        email: "test@demo.com",
        member_since: "March 2026",
        assessments_completed: 1,
        is_2fa_enabled: false
      });
      setLoading(false);
    }, 600);
  }, [navigate]);

  useGSAP(() => {
    if (!loading) {
      gsap.from(".profile-card", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
         <div className="w-16 h-16 border-4 border-lime-400/20 border-t-lime-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-lime-400 selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      
      {/* Navigation */}
      <nav className="relative z-10 bg-[#111]/80 backdrop-blur-xl border-b border-white/10 px-6 md:px-10 py-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
          <h1 className="text-lg font-bold text-white tracking-tighter">Early<span className="text-lime-400">Dementia.</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="text-white/60 hover:text-white font-medium text-sm transition-colors">
            Dashboard
          </button>
          <button onClick={() => authAPI.logout()}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto p-6 md:p-10 mt-8">
        <h2 className="profile-card text-4xl md:text-5xl font-black tracking-tight text-white mb-8">My Profile<span className="text-lime-400">.</span></h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="profile-card bg-[#111] p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-24 h-24 bg-white/5 text-lime-400 border border-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 font-black">
                {user.full_name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-white tracking-tighter">{user.full_name}</h3>
              <p className="text-sm text-white/50 mb-4">{user.email}</p>
              <span className="inline-block bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Active Member
              </span>
            </div>

            <div className="profile-card bg-[#111] p-6 rounded-2xl border border-white/5">
               <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Security</h4>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-white/50">Two-Factor Auth</span>
                 <span className={`text-xs font-bold px-2 py-1 rounded-md border ${user.is_2fa_enabled ? 'bg-lime-400/10 text-lime-400 border-lime-400/20' : 'bg-white/5 text-white/50 border-white/10'}`}>
                   {user.is_2fa_enabled ? 'Enabled' : 'Disabled'}
                 </span>
               </div>
               {!user.is_2fa_enabled && (
                 <button className="w-full mt-4 bg-lime-400 hover:bg-lime-300 text-black text-sm font-extrabold py-2 rounded-lg transition-colors shadow-lg shadow-lime-400/20">
                   Setup 2FA
                 </button>
               )}
            </div>
          </div>

          {/* Right Column: Stats & Settings */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="profile-card bg-[#111] p-6 rounded-2xl border border-white/5">
               <h3 className="text-lg font-bold text-white mb-6">Account Overview</h3>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                   <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Member Since</p>
                   <p className="text-lg font-black tracking-tight text-white">{user.member_since}</p>
                 </div>
                 <div className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                   <p className="text-lime-400 text-xs uppercase tracking-widest font-bold mb-1">Assessments</p>
                   <p className="text-2xl font-black text-lime-400">{user.assessments_completed}</p>
                 </div>
               </div>
            </div>

            <div className="profile-card bg-[#111] p-6 rounded-2xl border border-white/5">
               <h3 className="text-lg font-bold text-white mb-6">Preferences</h3>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/10">
                   <div>
                     <p className="font-bold text-white text-sm">Email Notifications</p>
                     <p className="text-xs text-white/50 mt-1">Receive assessment reminders and updates</p>
                   </div>
                   <div className="w-10 h-6 bg-lime-400 rounded-full relative shadow-inner">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full shadow-sm"></div>
                   </div>
                 </div>

                 <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/10">
                   <div>
                     <p className="font-bold text-white text-sm">Data Privacy</p>
                     <p className="text-xs text-white/50 mt-1">Allow anonymous data usage for research</p>
                   </div>
                   <div className="w-10 h-6 bg-white/10 rounded-full relative shadow-inner border border-white/10">
                     <div className="absolute left-1 top-1 w-4 h-4 bg-white/50 rounded-full shadow-sm"></div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="profile-card pt-4 flex justify-end">
               <button className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors border border-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-lg">
                 Delete Account
               </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
