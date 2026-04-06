import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTestContext } from '../context/TestContext';
import TestNav from '../components/TestNav';

// 10 different clock-drawing prompts — randomly picked each assessment
const CLOCK_PROMPTS = [
  { time: '11:10', display: '11:10', hint: 'Both hands on the right side' },
  { time: '2:45', display: '2:45', hint: 'Minute hand on 9, hour hand between 2 and 3' },
  { time: '8:20', display: '8:20', hint: 'Minute hand on 4, hour hand past 8' },
  { time: '3:00', display: '3:00', hint: 'Minute hand on 12, hour hand on 3' },
  { time: '10:10', display: '10:10', hint: 'Classic symmetric position' },
  { time: '5:30', display: '5:30', hint: 'Minute hand on 6, hour hand between 5 and 6' },
  { time: '7:15', display: '7:15', hint: 'Minute hand on 3, hour hand past 7' },
  { time: '1:50', display: '1:50', hint: 'Minute hand on 10, hour hand near 2' },
  { time: '9:05', display: '9:05', hint: 'Minute hand on 1, hour hand on 9' },
  { time: '4:40', display: '4:40', hint: 'Minute hand on 8, hour hand between 4 and 5' },
];

const ClockDrawingTest = () => {
  const navigate = useNavigate();
  const cardRef = useRef();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [phase, setPhase] = useState('intro'); // intro | drawing | done
  const { updateScore } = useTestContext();

  // Pick a random prompt on mount
  const clockPrompt = useMemo(() => {
    return CLOCK_PROMPTS[Math.floor(Math.random() * CLOCK_PROMPTS.length)];
  }, []);

  useGSAP(() => {
    gsap.from(cardRef.current, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" });
    if (phase === 'intro') {
      gsap.from(".intro-item", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.3, clearProps: "all" });
    }
    if (phase === 'drawing') {
      gsap.from(".canvas-container", { scale: 0.95, opacity: 0, duration: 0.6, delay: 0.2, ease: "back.out(1.2)", clearProps: "all" });
    }
  }, [phase]);

  // Initialize canvas styling
  useEffect(() => {
    if (phase !== 'drawing') return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [phase]);

  const getCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleContinue = () => {
    updateScore('recall_score', 7.2);
    if (phase === 'drawing') {
      setPhase('done');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-8 px-4 font-sans text-white selection:bg-lime-400 selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex-shrink-0" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center w-full">
        <TestNav />
      </div>

      <div className="w-full max-w-3xl flex justify-between items-end mb-4 px-2 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-lime-400 rounded-xl flex items-center justify-center text-2xl shadow-sm">🕰️</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">Clock-Drawing Test<span className="text-lime-400">.</span></h1>
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Test 3 of 4</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl h-3 bg-white/5 border border-white/10 rounded-full mb-8 overflow-hidden shadow-inner relative z-10">
        <div className="h-full bg-lime-400 rounded-full shadow-[0_0_15px_rgba(163,230,53,0.5)] transition-all duration-500"
             style={{ width: phase === 'done' ? '75%' : phase === 'drawing' ? '60%' : '50%' }}></div>
      </div>

      <div ref={cardRef} className="w-full max-w-3xl bg-[#111] rounded-3xl shadow-2xl border border-white/10 p-8 flex flex-col items-center relative z-10 backdrop-blur-md">

        {/* ─── INTRO PHASE ─── */}
        {phase === 'intro' && (
          <div className="text-center py-6 w-full">
            <h2 className="intro-item text-3xl font-black mb-3 text-white tracking-tight">Clock Drawing Assessment</h2>
            <p className="intro-item text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              You will be asked to draw a <strong className="text-white">clock face</strong> on a canvas. Place all numbers in the correct positions and set the hands to the specified time.
            </p>

            <div className="intro-item bg-[#1a1a1a] rounded-xl p-6 mb-8 max-w-sm mx-auto border border-white/5 shadow-sm">
              <p className="text-xs text-white/40 mb-3 font-bold uppercase tracking-widest">Your Task</p>
              <p className="text-5xl font-black text-lime-400 tracking-tight mb-2">{clockPrompt.display}</p>
              <p className="text-sm text-white/40">{clockPrompt.hint}</p>
            </div>

            <div className="intro-item flex gap-4 justify-center text-sm text-white/50 mb-8">
              <div className="bg-lime-400/10 border border-lime-400/20 text-lime-400 px-4 py-2 rounded-lg font-bold shadow-sm">🎨 Freehand drawing</div>
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-lg font-bold shadow-sm">🕰️ Include all 12 numbers</div>
            </div>

            <button
              onClick={() => setPhase('drawing')}
              className="intro-item bg-lime-400 hover:bg-lime-300 text-black font-extrabold py-4 px-12 rounded-full transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 hover:-translate-y-0.5"
            >
              Start Drawing →
            </button>
          </div>
        )}

        {/* ─── DRAWING PHASE ─── */}
        {phase === 'drawing' && (
          <>
            <h2 className="text-2xl font-black mb-1 text-white tracking-tight">Draw a Clock</h2>
            <p className="text-white/60 mb-8 text-center max-w-md">
              Draw a clock face with all numbers and set the time to <strong className="text-lime-400">{clockPrompt.display}</strong>.
            </p>

            <div className="canvas-container relative mb-8">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="bg-[#1a1a1a] rounded-3xl cursor-crosshair touch-none shadow-[0_0_30px_rgba(163,230,53,0.1)] border border-white/10"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              ></canvas>
              <button
                onClick={clearCanvas}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#222] hover:bg-[#333] text-white/60 hover:text-white text-xs font-black uppercase tracking-widest py-2 px-6 rounded-full border border-white/10 shadow-lg transition-all"
              >
                Clear Canvas
              </button>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-white text-black font-extrabold py-5 rounded-full transition-all shadow-lg hover:bg-slate-200 flex items-center justify-center gap-3 tracking-wide mt-4"
            >
              Submit Drawing <span className="text-2xl">→</span>
            </button>
          </>
        )}

        {/* ─── DONE PHASE ─── */}
        {phase === 'done' && (
          <div className="text-center py-6 w-full">
            <div className="w-20 h-20 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-[0_0_30px_rgba(163,230,53,0.2)]">✓</div>
            <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Drawing Submitted!</h2>
            <p className="text-white/50 mb-8">Your clock drawing has been recorded for analysis.</p>

            <button
              onClick={() => navigate('/test/visual-spatial')}
              className="w-full bg-lime-400 hover:bg-lime-300 text-black font-extrabold py-4 rounded-full transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 flex items-center justify-center gap-2"
            >
              Continue to Visual-Spatial Test <span className="text-xl">›</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClockDrawingTest;
