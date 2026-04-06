import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTestContext } from '../context/TestContext';
import TestNav from '../components/TestNav';

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
const COLOR_MAP = {
  Red: '#ef4444',
  Blue: '#3b82f6',
  Green: '#22c55e',
  Yellow: '#eab308',
  Purple: '#a855f7',
  Orange: '#f97316'
};

const SIZES = ['text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'];

function generateTrial() {
  const wordIdx = Math.floor(Math.random() * COLORS.length);
  let colorIdx = Math.floor(Math.random() * COLORS.length);
  // Only 30% chance of congruent (same word/color) to make it harder
  if (Math.random() > 0.7) colorIdx = wordIdx;
  
  const sizeClass = SIZES[Math.floor(Math.random() * SIZES.length)];
  return { word: COLORS[wordIdx], displayColor: COLORS[colorIdx], sizeClass };
}

const TOTAL_TRIALS = 15; // Increased trials
const TRIAL_TIMEOUT = 2500; // Decreased time to 2.5s for difficulty

const AttentionTest = () => {
  const navigate = useNavigate();
  const { updateScore } = useTestContext();
  const cardRef = useRef();
  const timerRef = useRef(null);

  const [phase, setPhase] = useState('intro'); // intro | playing | done
  const [trialIndex, setTrialIndex] = useState(0);
  const [trial, setTrial] = useState(generateTrial());
  const [results, setResults] = useState([]);
  const [trialStart, setTrialStart] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TRIAL_TIMEOUT); // ms

  useGSAP(() => {
    gsap.from(cardRef.current, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" });
    if (phase === 'intro') {
      gsap.from(".intro-item", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.3, clearProps: "all" });
    }
    if (phase === 'playing') {
      gsap.from(".trial-card", { scale: 0.98, opacity: 0.5, duration: 0.2 });
    }
  }, [phase, trialIndex]);

  // High-res timer for the smooth visual bar
  useEffect(() => {
    if (phase !== 'playing') return;
    
    setTimeLeft(TRIAL_TIMEOUT);
    const startObj = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startObj;
      const remaining = Math.max(0, TRIAL_TIMEOUT - elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleAnswer(null); // timeout
      }
    }, 50);
    
    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [phase, trialIndex]);

  const startTest = () => {
    setPhase('playing');
    setTrialIndex(0);
    setResults([]);
    setTrial(generateTrial());
    setTrialStart(Date.now());
  };

  const handleAnswer = useCallback((answer) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const reactionTime = Date.now() - trialStart;
    const isCorrect = answer === trial.displayColor;

    const newResult = { ...trial, answer, isCorrect, reactionTime };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    gsap.fromTo(".trial-word-display", { scale: 1.1 }, { scale: 1, duration: 0.15 });

    if (trialIndex + 1 >= TOTAL_TRIALS) {
      // Done - Calculate and save score
      const correctCount = updatedResults.filter(r => r.isCorrect).length;
      const score = Math.min((correctCount / TOTAL_TRIALS) * 10, 10);
      updateScore('attention_score', parseFloat(score.toFixed(1)));
      setPhase('done');
    } else {
      // Next trial
      setTrial(generateTrial());
      setTrialIndex(prev => prev + 1);
      setTrialStart(Date.now());
    }
  }, [trial, trialIndex, results, trialStart, updateScore]);

  const correctCount = results.filter(r => r.isCorrect).length;
  const timerPct = (timeLeft / TRIAL_TIMEOUT) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-8 px-4 font-sans text-white selection:bg-lime-400 selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex-shrink-0" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center w-full">
        <TestNav />
      </div>

      <div className="w-full max-w-3xl flex justify-between items-end mb-4 px-2 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-lime-400 rounded-xl flex items-center justify-center text-2xl shadow-sm">🎯</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">Attention Test<span className="text-lime-400">.</span></h1>
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Test 2 of 4</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl h-3 bg-white/5 border border-white/10 rounded-full mb-8 overflow-hidden shadow-inner flex relative z-10">
        <div className="h-full bg-lime-400 transition-all duration-300 shadow-[0_0_15px_rgba(163,230,53,0.5)]" style={{ width: '25%' }}></div>
        <div className="h-full bg-white/20 transition-all duration-500" style={{ width: phase === 'done' ? '25%' : `${(trialIndex / TOTAL_TRIALS) * 25}%` }}></div>
      </div>

      <div ref={cardRef} className="w-full max-w-3xl bg-[#111] rounded-3xl shadow-2xl border border-white/10 p-8 relative z-10 backdrop-blur-md">

        {/* ─── INTRO PHASE ─── */}
        {phase === 'intro' && (
          <div className="text-center py-6">
            <h2 className="intro-item text-3xl font-black mb-3 text-white tracking-tight">Rapid Stroop Test</h2>
            <p className="intro-item text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              You will see color <strong className="text-white">words</strong> in different <strong className="text-white">ink colors</strong> and varying sizes. Your task is to quickly identify the <strong className="text-white">ink color</strong>, ignoring the word.
            </p>

            <div className="intro-item bg-[#1a1a1a] rounded-xl p-6 mb-8 max-w-sm mx-auto border border-white/5 shadow-sm">
              <p className="text-xs text-white/40 mb-3 font-bold uppercase tracking-widest">Example</p>
              <p className="text-4xl font-black tracking-tight mb-3" style={{ color: '#3b82f6' }}>Red</p>
              <p className="text-sm text-white/60">The word says "Red" but the ink color is <strong className="text-blue-500">Blue</strong>. Correct answer is <strong className="text-blue-500">Blue</strong>.</p>
            </div>

            <div className="intro-item flex gap-4 justify-center text-sm text-white/50 mb-8">
              <div className="bg-lime-400/10 border border-lime-400/20 text-lime-400 px-4 py-2 rounded-lg font-bold shadow-sm">⏱ {TOTAL_TRIALS} trials</div>
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold shadow-sm">⚡ {TRIAL_TIMEOUT / 1000}s per trial!</div>
            </div>

            <button
              onClick={startTest}
              style={{ opacity: 1, visibility: 'visible' }}
              className="intro-item bg-lime-400 hover:bg-lime-300 text-black font-extrabold py-4 px-12 rounded-full transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 hover:-translate-y-0.5"
            >
              Start Attention Test →
            </button>
          </div>
        )}

        {/* ─── PLAYING PHASE ─── */}
        {phase === 'playing' && (
          <div className="trial-card">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">What is the <span className="text-lime-400">ink color</span>?</h2>
              <span className="bg-white/5 border border-white/10 text-white/50 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest">Trial {trialIndex + 1}/{TOTAL_TRIALS}</span>
            </div>

            {/* Timer Bar */}
            <div className="h-1.5 w-full bg-white/5 rounded-full mb-8 overflow-hidden">
               <div className={`h-full transition-all ease-linear ${timerPct > 40 ? 'bg-lime-400' : timerPct > 15 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${timerPct}%` }}></div>
            </div>

            <div className="bg-[#1a1a1a] rounded-3xl p-16 mb-10 text-center border border-white/5 shadow-inner flex items-center justify-center min-h-[220px]">
              <p className={`trial-word-display font-black tracking-tighter ${trial.sizeClass} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`} style={{ color: COLOR_MAP[trial.displayColor] }}>
                {trial.word}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => handleAnswer(color)}
                  className="py-4 px-2 rounded-2xl border-2 text-sm md:text-base font-black tracking-wider uppercase transition-all hover:scale-105 active:scale-95 shadow-sm"
                  style={{
                    borderColor: `${COLOR_MAP[color]}40`,
                    color: COLOR_MAP[color],
                    backgroundColor: `${COLOR_MAP[color]}10`,
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
            
          </div>
        )}

        {/* ─── DONE PHASE ─── */}
        {phase === 'done' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-[0_0_30px_rgba(163,230,53,0.2)]">✓</div>
            <h2 className="text-4xl font-black tracking-tight mb-3 text-white">Test Complete<span className="text-lime-400">!</span></h2>
            <p className="text-white/50 mb-10 font-bold uppercase tracking-widest text-sm">You got <span className="text-lime-400">{correctCount}</span> out of {TOTAL_TRIALS} correct.</p>

            <button
              onClick={() => navigate('/test/clock-drawing')}
              className="w-full bg-lime-400 hover:bg-lime-300 text-black font-extrabold py-4 rounded-full transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 flex items-center justify-center gap-2"
            >
              Continue to Clock-Drawing Test <span className="text-xl">›</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttentionTest;
