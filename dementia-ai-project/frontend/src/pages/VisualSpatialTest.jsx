import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { analysisAPI } from '../services/api';
import { useTestContext } from '../context/TestContext';
import TestNav from '../components/TestNav';

// Helper to shuffle an array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Helper to flip 1 or 2 bits in a pattern to create a distractor
function createDistractor(pattern, flips = 1) {
  const d = [...pattern];
  const indices = [];
  while (indices.length < flips) {
    const idx = Math.floor(Math.random() * d.length);
    if (!indices.includes(idx)) {
      indices.push(idx);
      d[idx] = d[idx] === 1 ? 0 : 1;
    }
  }
  return d;
}

// 10 different reference patterns (4x4 grids = 16 elements)
const PATTERN_POOL = [
  [1,1,0,0, 1,0,0,1, 0,0,1,1, 0,1,1,0],
  [0,1,1,0, 1,0,0,1, 1,0,0,1, 0,1,1,0],
  [1,0,1,0, 0,1,0,1, 1,0,1,0, 0,1,0,1],
  [1,1,1,0, 0,0,0,1, 1,0,0,0, 0,1,1,1],
  [0,0,1,1, 0,1,1,0, 1,1,0,0, 1,0,0,1],
  [1,0,0,1, 0,1,1,0, 0,1,1,0, 1,0,0,1],
  [1,1,0,1, 0,0,1,0, 0,1,0,0, 1,0,1,1],
  [0,1,0,1, 1,1,0,0, 0,0,1,1, 1,0,1,0],
  [1,0,1,1, 1,1,0,0, 0,0,1,1, 1,1,0,1],
  [0,1,1,1, 1,0,0,0, 0,0,0,1, 1,1,1,0],
];

// Grid component
const PatternGrid = ({ pattern, isSelectable, isSelected, onClick }) => (
  <div
    onClick={onClick}
    onKeyDown={(e) => {
      if (isSelectable && onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    role={isSelectable ? 'button' : 'img'}
    tabIndex={isSelectable ? 0 : undefined}
    aria-label={isSelectable ? 'Selectable pattern option' : 'Reference pattern'}
    className={`grid grid-cols-4 gap-1 p-2 bg-[#1a1a1a] rounded-2xl transition-all duration-200 ${
      isSelectable ? 'cursor-pointer hover:shadow-lg hover:border-lime-400/50 border-2' : 'border-2 border-transparent'
    } ${isSelected ? 'border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)] scale-105 bg-lime-400/10' : 'border-white/10'}`}
  >
    {pattern.map((isLime, idx) => (
      <div
        key={idx}
        className={`w-8 h-8 rounded-lg ${isLime ? 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]' : 'bg-white/5 border border-white/10 shadow-inner'}`}
      ></div>
    ))}
  </div>
);

const VisualSpatialTest = () => {
  const navigate = useNavigate();
  const cardRef = useRef();
  const [phase, setPhase] = useState('intro'); // intro | testing | done
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { testScores } = useTestContext();

  // Randomly pick a pattern and generate distractors on mount
  const puzzle = useMemo(() => {
    const refPattern = PATTERN_POOL[Math.floor(Math.random() * PATTERN_POOL.length)];
    const correctIdx = Math.floor(Math.random() * 4); // random position for the correct answer
    const options = [];
    for (let i = 0; i < 4; i++) {
      if (i === correctIdx) {
        options.push([...refPattern]); // exact match
      } else {
        // Create distractors with 1-2 flipped bits
        options.push(createDistractor(refPattern, Math.random() > 0.5 ? 2 : 1));
      }
    }
    return { referencePattern: refPattern, options, correctIdx };
  }, []);

  useGSAP(() => {
    gsap.from(cardRef.current, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" });
    if (phase === 'intro') {
      gsap.from(".intro-item", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.3, clearProps: "all" });
    }
    if (phase === 'testing') {
      gsap.from(".pattern-option", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.4, clearProps: "all" });
    }
  }, [phase]);

  const handleSubmit = async () => {
    if (selectedPattern === null) return alert("Please select a pattern first.");

    setIsSubmitting(true);
    try {
      const visualScore = selectedPattern === puzzle.correctIdx ? 10.0 : 4.0;
      const finalAttention = testScores.attention_score > 0
        ? (testScores.attention_score + visualScore) / 2
        : visualScore;

      await analysisAPI.submitTest({
        patient_id: testScores.patient_id,
        memory_score: testScores.memory_score,
        recall_score: testScores.recall_score,
        attention_score: parseFloat(finalAttention.toFixed(1))
      });

      navigate('/results');
    } catch (error) {
      console.error("Failed to submit to database:", error);
      alert("Error saving data. Is the backend running?");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-8 px-4 font-sans text-white selection:bg-lime-400 selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex-shrink-0" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center w-full">
        <TestNav />
      </div>

      <div className="w-full max-w-4xl flex justify-between items-end mb-4 px-2 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-lime-400 rounded-xl flex items-center justify-center text-2xl shadow-sm">△</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">Visual-Spatial Test<span className="text-lime-400">.</span></h1>
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Test 4 of 4</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl h-3 bg-white/5 border border-white/10 rounded-full mb-8 overflow-hidden shadow-inner relative z-10">
        <div className="h-full bg-lime-400 rounded-full shadow-[0_0_15px_rgba(163,230,53,0.5)] transition-all duration-500"
             style={{ width: phase === 'done' ? '100%' : phase === 'testing' ? '85%' : '75%' }}></div>
      </div>

      <div ref={cardRef} className="w-full max-w-5xl bg-[#111] rounded-3xl shadow-2xl border border-white/10 p-8 relative z-10 backdrop-blur-md">

        {/* ─── INTRO PHASE ─── */}
        {phase === 'intro' && (
          <div className="text-center py-6">
            <h2 className="intro-item text-3xl font-black mb-3 text-white tracking-tight">Pattern Recognition</h2>
            <p className="intro-item text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              You will be shown a <strong className="text-white">4×4 pattern</strong>. Your task is to find the <strong className="text-lime-400">exact matching pattern</strong> from four options. Pay close attention — the distractors differ by only 1-2 cells.
            </p>

            <div className="intro-item bg-[#1a1a1a] rounded-xl p-6 mb-8 max-w-xs mx-auto border border-white/5 shadow-sm">
              <p className="text-xs text-white/40 mb-4 font-bold uppercase tracking-widest">Preview</p>
              <div className="flex justify-center">
                <PatternGrid pattern={puzzle.referencePattern} isSelectable={false} />
              </div>
            </div>

            <div className="intro-item flex gap-4 justify-center text-sm text-white/50 mb-8">
              <div className="bg-lime-400/10 border border-lime-400/20 text-lime-400 px-4 py-2 rounded-lg font-bold shadow-sm">👁️ 4 options to compare</div>
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold shadow-sm">⚠️ Only 1 is correct</div>
            </div>

            <button
              onClick={() => setPhase('testing')}
              className="intro-item bg-lime-400 hover:bg-lime-300 text-black font-extrabold py-4 px-12 rounded-full transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 hover:-translate-y-0.5"
            >
              Start Pattern Test →
            </button>
          </div>
        )}

        {/* ─── TESTING PHASE ─── */}
        {phase === 'testing' && (
          <>
            <h2 className="text-2xl font-black mb-1 text-white tracking-tight">Pattern Recognition</h2>
            <p className="text-white/60 mb-6">Find the exact matching <strong className="text-lime-400">4x4 pattern</strong> shown above.</p>

            <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 py-10 flex flex-col items-center justify-center mb-10 shadow-inner">
              <p className="text-xs text-white/40 mb-4 font-bold tracking-widest uppercase">Reference Pattern</p>
              <div className="scale-110 drop-shadow-xl">
                <PatternGrid pattern={puzzle.referencePattern} isSelectable={false} />
              </div>
            </div>

            <h3 className="font-bold text-white/80 mb-4 tracking-wide">Select the matching pattern:</h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {puzzle.options.map((opt, idx) => (
                <div key={idx} style={{ opacity: 1, visibility: 'visible' }} className="pattern-option flex justify-center p-6 border border-white/5 rounded-3xl bg-[#1a1a1a] shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all">
                   <PatternGrid
                     pattern={opt}
                     isSelectable={true}
                     isSelected={selectedPattern === idx}
                     onClick={() => setSelectedPattern(idx)}
                   />
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full font-extrabold py-5 rounded-full transition-all flex items-center justify-center gap-3 tracking-wide ${
                isSubmitting ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-lime-400 hover:bg-lime-300 text-black shadow-[0_0_30px_rgba(163,230,53,0.2)] hover:shadow-[0_0_40px_rgba(163,230,53,0.4)] group'
              }`}
            >
              {isSubmitting ? 'Saving to Database...' : (
                <>
                  Submit Assessment & View Results <span className="text-2xl transition-transform group-hover:translate-x-1">→</span>
                </>
              )}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default VisualSpatialTest;
