import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { analysisAPI } from '../services/api';
import logo from '../assets/logo.jpg.png';

const ScoreDetail = ({ label, value, max = 10, description, delay = 0, icon }) => {
  const barRef = useRef();
  const pct = Math.min((value / max) * 100, 100);
  const barColor = pct >= 70 ? 'bg-lime-400' : pct >= 40 ? 'bg-amber-400' : 'bg-red-500';
  const barGlow = pct >= 70
    ? 'shadow-[0_0_20px_rgba(163,230,53,0.6)]'
    : pct >= 40
      ? 'shadow-[0_0_20px_rgba(251,191,36,0.6)]'
      : 'shadow-[0_0_20px_rgba(239,68,68,0.6)]';
  const scoreColor = pct >= 70 ? 'text-lime-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400';

  useGSAP(() => {
    gsap.from(barRef.current, { width: 0, duration: 1.2, delay, ease: "power3.out" });
  }, []);

  return (
    <div className="p-6 bg-[#111] rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300 group hover:shadow-lg">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-lg font-black text-white tracking-tight">{label}</h4>
            <span className={`text-2xl font-black ${scoreColor}`}>{value}<span className="text-sm text-white/30">/{max}</span></span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="w-full bg-white/5 rounded-full h-3.5 overflow-hidden border border-white/10">
        <div ref={barRef} className={`h-full rounded-full ${barColor} ${barGlow} transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

const Results = () => {
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
        setError('Failed to load analysis data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useGSAP(() => {
    if (!data) return;
    gsap.from(".res-anim", { y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", clearProps: "all" });
    gsap.from(".stat-num", { textContent: 0, duration: 1.5, delay: 0.3, ease: "power2.out", snap: { textContent: 1 } });
  }, { dependencies: [data], scope: mainRef });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-lime-400/20 border-t-lime-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50 font-bold uppercase tracking-widest text-sm">Analyzing Results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-white mb-4">No Results Found</h2>
          <button onClick={() => navigate('/dashboard')} className="bg-white text-black px-6 py-3 rounded-full font-bold">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const isDetected = data.result.status === 'Detected';

  // Format descriptions
  const memoryScore = data.test_data.find(d => d.label === 'Memory Score')?.value || 0;
  const attentionScore = data.test_data.find(d => d.label === 'Attention Score')?.value || 0;
  const recallScore = data.test_data.find(d => d.label === 'Recall Score')?.value || 0;

  // Dynamic glow color for the hero
  const glowColor = isDetected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(163, 230, 53, 0.15)';
  const glowColorStrong = isDetected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(163, 230, 53, 0.25)';

  return (
    <div ref={mainRef} className="min-h-screen bg-[#0a0a0a] font-sans pb-20 text-white selection:bg-lime-400 selection:text-black relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      
      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none z-0" 
           style={{ background: `radial-gradient(ellipse at center, ${glowColorStrong} 0%, transparent 70%)` }}></div>
      <div className="absolute top-[40%] -left-40 w-[500px] h-[500px] rounded-full pointer-events-none z-0 blur-3xl"
           style={{ background: isDetected ? 'rgba(239, 68, 68, 0.08)' : 'rgba(163, 230, 53, 0.08)' }}></div>
      <div className="absolute top-[60%] -right-40 w-[500px] h-[500px] rounded-full pointer-events-none z-0 blur-3xl"
           style={{ background: isDetected ? 'rgba(251, 146, 60, 0.06)' : 'rgba(6, 182, 212, 0.06)' }}></div>
      
      {/* Navigation */}
      <nav className="relative z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-6 md:px-10 py-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
          <h1 className="text-lg font-bold text-white tracking-tighter">Early<span className="text-lime-400">Dementia.</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/test/memory')}
            className="bg-lime-400/10 border border-lime-400/30 hover:bg-lime-400/20 text-lime-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            New Test
          </button>
          <button onClick={() => navigate('/dashboard')}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">
            Dashboard
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto pt-10 px-4">
        
        {/* ─── HERO CARD ─── */}
        <div className="res-anim mb-10">
          <div className={`relative p-10 md:p-14 rounded-3xl text-center border overflow-hidden ${
            isDetected 
              ? 'bg-gradient-to-b from-red-500/15 via-red-900/10 to-[#111] border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.15)]' 
              : 'bg-gradient-to-b from-lime-400/15 via-lime-900/10 to-[#111] border-lime-400/30 shadow-[0_0_60px_rgba(163,230,53,0.15)]'
          }`}>

            {/* Inner glow ring */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
                 style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}></div>

            {/* Status Badge */}
            <div className="inline-block mb-6 relative">
              <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] ${
                isDetected
                  ? 'bg-red-500/25 text-red-300 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'bg-lime-400/25 text-lime-300 border-2 border-lime-400/50 shadow-[0_0_20px_rgba(163,230,53,0.3)]'
              }`}>
                ● {data.result.status}
              </span>
            </div>

            {/* Main Heading */}
            <h2 className={`text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight ${
              isDetected ? 'text-red-300' : 'text-lime-300'
            }`}>
              {data.result.stage === 'Normal' ? 'No Signs of Cognitive Decline' : `${data.result.stage} Stage Detected`}
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Based on the comprehensive assessment completed on <strong className="text-white">{data.overview.date}</strong>, your cognitive health profile has been analyzed.
            </p>

            {/* Stats Row */}
            <div className="inline-flex gap-1 items-stretch bg-[#0a0a0a]/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              <div className="px-8 py-6 text-center">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-2">AI Confidence</p>
                <p className={`text-5xl font-black tracking-tighter ${isDetected ? 'text-red-400' : 'text-lime-400'}`}>
                  {data.result.score}<span className="text-2xl text-white/30">%</span>
                </p>
              </div>
              <div className="w-px bg-white/10 my-4"></div>
              <div className="px-8 py-6 text-center">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-2">Patient</p>
                <p className="text-2xl font-bold text-white">{data.patient.name}</p>
                <p className="text-xs text-white/30 font-mono mt-1">{data.patient.patient_id}</p>
              </div>
              <div className="w-px bg-white/10 my-4"></div>
              <div className="px-8 py-6 text-center">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-2">Stage</p>
                <p className={`text-2xl font-black ${isDetected ? 'text-red-400' : 'text-lime-400'}`}>{data.result.stage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CLINICAL ANALYSIS ─── */}
        <div className="res-anim mb-10">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-10 h-10 bg-white/5 border border-white/10 text-lime-400 rounded-xl flex items-center justify-center text-lg">📋</div>
            <h3 className="text-2xl font-black text-white tracking-tight">Clinical Analysis Summary</h3>
          </div>
          <div className={`p-8 md:p-10 rounded-3xl border text-white/70 leading-relaxed text-lg font-medium ${
            isDetected 
              ? 'bg-[#111] border-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.05)]'
              : 'bg-[#111] border-lime-400/10 shadow-[0_0_30px_rgba(163,230,53,0.05)]'
          }`}>
            {isDetected ? (
              <p>
                The assessment results indicate some variations in your cognitive performance, specifically falling into the <strong className={`font-extrabold ${isDetected ? 'text-red-400' : 'text-lime-400'}`}>{data.result.stage}</strong> category. 
                This algorithmic observation suggests that certain areas like short-term recall or selective attention are currently operating below expected baselines for your demographic. 
                <br/><br/>
                <strong className="text-white">Recommendation:</strong> While this tool provides an AI screening analysis, it is <em className="text-white">not a medical diagnosis</em>. We highly recommend discussing these results with a licensed neurologist or healthcare provider for a clinical evaluation.
              </p>
            ) : (
              <p>
                Excellent news. The assessment results indicate a healthy cognitive profile. Your performance across memory encoding, selective attention, and visuospatial tasks aligns with standard healthy baselines. 
                <br/><br/>
                <strong className="text-lime-400 font-extrabold">Recommendation:</strong> Continue maintaining a healthy lifestyle, including regular cardiovascular exercise, mental stimulation, and a balanced diet to preserve cognitive longevity. You can re-take this assessment annually to monitor your baseline.
              </p>
            )}
          </div>
        </div>

        {/* ─── PERFORMANCE BREAKDOWN ─── */}
        <div className="res-anim mb-10">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-10 h-10 bg-white/5 border border-white/10 text-lime-400 rounded-xl flex items-center justify-center text-lg">📊</div>
            <h3 className="text-2xl font-black text-white tracking-tight">Performance Breakdown</h3>
          </div>
          <div className="space-y-4">
            <ScoreDetail 
              icon="🧠"
              label="Working Memory" 
              value={memoryScore} 
              description="Measures your ability to encode new information and temporarily hold it for immediate processing." 
              delay={0.2}
            />
            <ScoreDetail 
              icon="🎯"
              label="Selective Attention" 
              value={attentionScore} 
              description="Evaluates your focus, reaction time, and ability to suppress distracting information (Stroop effect)." 
              delay={0.4}
            />
            <ScoreDetail 
              icon="🕰️"
              label="Delayed Recall & Visuospatial" 
              value={recallScore} 
              description="Assesses your spatial awareness, executive functioning, and ability to retrieve information after a delay." 
              delay={0.6}
            />
          </div>
        </div>

        {/* ─── AI MODEL PREDICTIONS (mini) ─── */}
        {data.model_predictions && (
          <div className="res-anim mb-10">
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-10 h-10 bg-white/5 border border-white/10 text-lime-400 rounded-xl flex items-center justify-center text-lg">🤖</div>
              <h3 className="text-2xl font-black text-white tracking-tight">AI Model Predictions</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {data.model_predictions.map((pred, i) => {
                const colors = [
                  'from-lime-400/10 to-lime-400/5 border-lime-400/20 text-lime-400',
                  'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
                  'from-red-500/10 to-red-500/5 border-red-500/20 text-red-400'
                ];
                const glows = [
                  'shadow-[0_0_25px_rgba(163,230,53,0.1)]',
                  'shadow-[0_0_25px_rgba(251,191,36,0.1)]',
                  'shadow-[0_0_25px_rgba(239,68,68,0.1)]'
                ];
                return (
                  <div key={i} className={`text-center p-6 rounded-2xl border bg-gradient-to-b ${colors[i]} ${glows[i]} hover:scale-105 transition-transform duration-300`}>
                    <p className="text-4xl font-black tracking-tighter">{Math.round(pred.value * 100)}%</p>
                    <p className="text-xs font-bold mt-2 uppercase tracking-[0.15em] text-white/40">{pred.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-[#111] rounded-xl border border-white/5">
              <p className="text-xs text-white/30 leading-relaxed">
                <strong className="text-white/60">Disclaimer:</strong> These predictions are generated by an AI model for informational purposes only. 
                They are not a clinical diagnosis. Please consult a qualified healthcare professional for proper evaluation.
              </p>
            </div>
          </div>
        )}

        {/* ─── ACTIONS ─── */}
        <div className="res-anim mt-14 flex flex-col sm:flex-row gap-4 justify-center pb-8">
          <button onClick={() => window.print()}
            className="bg-[#1a1a1a] hover:bg-[#222] border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-full font-bold shadow-sm transition-all text-sm uppercase tracking-widest">
            📄 Download Report
          </button>
          <button onClick={() => navigate('/dashboard')}
            className={`px-8 py-4 rounded-full font-extrabold shadow-xl transition-all hover:-translate-y-1 text-lg flex items-center justify-center gap-2 tracking-wide ${
              isDetected
                ? 'bg-white text-black hover:bg-slate-200'
                : 'bg-lime-400 hover:bg-lime-300 text-black shadow-[0_0_30px_rgba(163,230,53,0.2)]'
            }`}>
            Continue to Dashboard <span className="text-2xl">→</span>
          </button>
        </div>

      </main>
    </div>
  );
};

export default Results;
