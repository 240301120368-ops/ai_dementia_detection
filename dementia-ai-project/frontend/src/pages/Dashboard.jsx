import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { analysisAPI, authAPI } from '../services/api';
import logo from '../assets/logo.jpg.png';

// ─── Score Bar Component ───
const ScoreBar = ({ label, value, max = 10, delay = 0 }) => {
  const barRef = useRef();
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? 'bg-lime-400' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400';

  useGSAP(() => {
    gsap.from(barRef.current, { width: 0, duration: 1, delay, ease: "power3.out" });
  }, []);

  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-sm font-medium text-white/50 w-36">{label}</span>
      <div className="flex-1 bg-white/5 border border-white/10 rounded-full h-3 overflow-hidden">
        <div ref={barRef} className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
      <span className="text-sm font-bold text-white w-16 text-right">{value} / {max}</span>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mainRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analysisAPI.getLatest();
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No assessment data found. Please complete a cognitive assessment first.');
        } else {
          setError('Failed to load analysis data. Is the backend running?');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useGSAP(() => {
    if (!data) return;
    gsap.from(".dash-card", { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", clearProps: "all" });
    gsap.from(".prediction-card", { scale: 0.9, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: "back.out(1.4)", clearProps: "all" });
  }, { dependencies: [data], scope: mainRef });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-lime-400/20 border-t-lime-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50 font-medium">Loading Analysis Data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        <div className="text-center max-w-md relative z-10 bg-[#111] p-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
          <p className="text-white/50 mb-6">{error || 'Complete an assessment to see your results here.'}</p>
          <button onClick={() => navigate('/test/memory')}
            className="bg-lime-400 hover:bg-lime-300 w-full text-black px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5">
            Take Assessment →
          </button>
        </div>
      </div>
    );
  }

  const isDetected = data.result.status === 'Detected';
  const statusColor = isDetected ? 'red' : 'green';

  return (
    <div ref={mainRef} className="min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-lime-400 selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      {/* ─── Top Navigation ─── */}
      <nav className="relative z-10 bg-[#111]/80 backdrop-blur-xl border-b border-white/10 px-6 md:px-10 py-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
          <h1 className="text-lg font-bold text-white tracking-tighter">Early<span className="text-lime-400">Dementia.</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white/50 hidden sm:inline">Assessment Results</span>
          <button onClick={() => navigate('/profile')}
            className="text-white/60 hover:text-white font-medium text-sm transition-colors">
            Profile
          </button>
          <button onClick={() => navigate('/test/memory')}
            className="bg-lime-400/10 border border-lime-400/30 hover:bg-lime-400/20 text-lime-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            New Test
          </button>
          <button onClick={() => authAPI.logout()}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 space-y-8">

        {/* ─── Header ─── */}
        <div className="dash-card" style={{ opacity: 1, visibility: 'visible' }}>
          <p className="text-sm text-lime-400 font-bold uppercase tracking-widest mb-2">Patient Assessment Report</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Cognitive Health Analysis<span className="text-lime-400">.</span></h2>
        </div>

        {/* ─── Top Cards Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Patient Card */}
          <div className="dash-card bg-[#111] p-6 rounded-2xl border border-white/5" style={{ opacity: 1, visibility: 'visible' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/5 text-lime-400 rounded-xl flex items-center justify-center text-lg border border-white/10">👤</div>
              <h3 className="text-lg font-bold text-white">Patient Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/50">Name</span>
                <span className="font-semibold text-white">{data.patient.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/50">Age</span>
                <span className="font-semibold text-white">{data.patient.age}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/50">Patient ID</span>
                <span className="font-mono font-semibold text-lime-400">{data.patient.patient_id}</span>
              </div>
            </div>
          </div>

          {/* Overview Card */}
          <div className="dash-card bg-[#111] p-6 rounded-2xl border border-white/5" style={{ opacity: 1, visibility: 'visible' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/5 text-lime-400 rounded-xl flex items-center justify-center text-lg border border-white/10">📋</div>
              <h3 className="text-lg font-bold text-white">Analysis Overview</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-white/50">Date</span>
                <span className="font-semibold text-white">{data.overview.date}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/50">Analyzed By</span>
                <span className="font-semibold text-white">{data.overview.technician}</span>
              </div>
            </div>
          </div>

          {/* RESULT Card (the key card) */}
          <div style={{ opacity: 1, visibility: 'visible' }} className={`dash-card p-6 rounded-2xl border ${
            isDetected ? 'bg-red-950/20 border-red-500/30' : 'bg-lime-400/5 border-lime-400/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Dementia Result</h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                isDetected ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-lime-400/10 text-lime-400 border-lime-400/20'
              }`}>
                {data.result.status}
              </span>
            </div>
            <p className={`text-4xl font-extrabold mb-1 tracking-tighter ${isDetected ? 'text-red-400' : 'text-lime-400'}`}>
              {data.result.stage} Stage
            </p>
            <p className="text-sm text-white/50">
              Confidence: <span className="font-bold text-white">{data.result.score}%</span>
            </p>
          </div>
        </div>

        {/* ─── Bottom Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Test Scores */}
          <div className="dash-card bg-[#111] p-6 rounded-2xl border border-white/5" style={{ opacity: 1, visibility: 'visible' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white/5 text-lime-400 border border-white/10 rounded-xl flex items-center justify-center text-lg">📊</div>
              <h3 className="text-lg font-bold text-white">Cognitive Test Scores</h3>
            </div>
            <div className="space-y-1">
              {data.test_data.map((test, i) => (
                <ScoreBar key={i} label={test.label} value={test.value} delay={i * 0.15} />
              ))}
            </div>
          </div>

          {/* AI Predictions */}
          <div className="dash-card bg-[#111] p-6 rounded-2xl border border-white/5" style={{ opacity: 1, visibility: 'visible' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white/5 text-lime-400 border border-white/10 rounded-xl flex items-center justify-center text-lg">🤖</div>
              <h3 className="text-lg font-bold text-white">AI Model Predictions</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {data.model_predictions.map((pred, i) => {
                const colors = ['bg-lime-400/5 text-lime-400 border-lime-400/20', 'bg-amber-500/5 text-amber-500 border-amber-500/20', 'bg-red-500/5 text-red-500 border-red-500/20'];
                return (
                  <div key={i} style={{ opacity: 1, visibility: 'visible' }} className={`prediction-card text-center p-5 rounded-xl border ${colors[i]}`}>
                    <p className="text-3xl font-black tracking-tighter">{Math.round(pred.value * 100)}%</p>
                    <p className="text-xs font-bold mt-1 uppercase tracking-widest">{pred.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
              <p className="text-xs text-white/40 leading-relaxed">
                <strong className="text-white/80">Disclaimer:</strong> These predictions are generated by an AI model for informational purposes only. 
                They are not a clinical diagnosis. Please consult a qualified healthcare professional for proper evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Actions ─── */}
        <div className="dash-card flex flex-wrap gap-4 justify-center pt-4" style={{ opacity: 1, visibility: 'visible' }}>
          <button onClick={() => navigate('/test/memory')}
            className="bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 rounded-full font-bold shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5">
            Take Another Assessment
          </button>
          <button onClick={() => window.print()}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-full font-bold transition-all">
            Print Report
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
