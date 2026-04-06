import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTestContext } from '../context/TestContext';
import TestNav from '../components/TestNav';

// 10 different word sets — one is picked randomly per assessment
const WORD_SETS = [
  { targets: ["APPLE","TIGER","GUITAR","SUNRISE","MOUNTAIN","CHAIR","OCEAN","SCOOTER"], distractors: ["VALLEY","TABLE","RIVER","BANANA","BICYCLE","PIANO","SUNSET","ELEPHANT"] },
  { targets: ["CANDLE","FOREST","HAMMER","SILVER","PUZZLE","ROCKET","BLANKET","MARBLE"], distractors: ["FEATHER","TUNNEL","BRIDGE","LANTERN","COPPER","BASKET","PILLOW","SHADOW"] },
  { targets: ["DOLPHIN","CASTLE","VIOLIN","THUNDER","GARDEN","PENCIL","DIAMOND","WINDOW"], distractors: ["FALCON","TOWER","TRUMPET","BREEZE","MEADOW","CRAYON","CRYSTAL","CURTAIN"] },
  { targets: ["COMPASS","PARROT","CHERRY","WAGON","HELMET","PLANET","RIBBON","TUNNEL"], distractors: ["ANCHOR","ROBIN","PEACH","CARRIAGE","SHIELD","COMET","THREAD","CAVERN"] },
  { targets: ["LANTERN","EAGLE","MANGO","CANVAS","GLACIER","BUTTON","CORAL","MIRROR"], distractors: ["BEACON","FALCON","PAPAYA","EASEL","VOLCANO","ZIPPER","PEARL","WINDOW"] },
  { targets: ["DRAGON","CACTUS","FLUTE","TORNADO","ISLAND","MAGNET","CLOVER","BASKET"], distractors: ["PHOENIX","BAMBOO","HARP","CYCLONE","HARBOR","ANCHOR","THISTLE","CRATE"] },
  { targets: ["RAVEN","SUMMIT","TROPHY","GINGER","HARBOR","NEEDLE","PRISM","SADDLE"], distractors: ["CRANE","VALLEY","MEDAL","PEPPER","MARINA","THREAD","LENS","BRIDLE"] },
  { targets: ["WALNUT","SPHINX","EMBER","ORCHID","ANCHOR","KETTLE","DAGGER","FOSSIL"], distractors: ["ALMOND","PYRAMID","FLAME","LILY","COMPASS","TEAPOT","SWORD","RELIC"] },
  { targets: ["FALCON","COBALT","BREEZE","TEMPLE","ACORN","SIREN","PEBBLE","VOYAGE"], distractors: ["SPARROW","CRIMSON","GALE","CHAPEL","PINECONE","ALARM","STONE","JOURNEY"] },
  { targets: ["BEACON","OTTER","PLUME","COPPER","CAVERN","SPINDLE","NECTAR","ATLAS"], distractors: ["SIGNAL","BADGER","QUILL","BRONZE","GROTTO","BOBBIN","SYRUP","GLOBE"] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MemoryTest = () => {
  const navigate = useNavigate();
  const cardRef = useRef();

  // Pick a random word set on mount
  const wordSet = useMemo(() => {
    const set = WORD_SETS[Math.floor(Math.random() * WORD_SETS.length)];
    return {
      targets: shuffle(set.targets),
      allWords: shuffle([...set.targets, ...set.distractors]),
    };
  }, []);

  const [phase, setPhase] = useState('intro'); // intro | study | recall | done
  const [studyIndex, setStudyIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const { updateScore } = useTestContext();

  useGSAP(() => {
    gsap.from(cardRef.current, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" });
    if (phase === 'intro') {
      gsap.from(".intro-item", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.3 });
    }
    if (phase === 'study') {
      gsap.fromTo(".study-word",
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }
      );
    }
    if (phase === 'recall') {
      gsap.from(".word-btn", {
        scale: 0.85, opacity: 0, duration: 0.3, stagger: 0.03, ease: "back.out(1.4)", clearProps: "all"
      });
    }
  }, [phase, studyIndex]);

  useEffect(() => {
    if (phase !== 'study') return;
    const timer = setTimeout(() => {
      if (studyIndex < wordSet.targets.length - 1) {
        setStudyIndex(prev => prev + 1);
      } else {
        setPhase('recall');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, studyIndex, wordSet.targets.length]);

  const toggleWord = (word) => {
    setSelectedWords(prev =>
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const handleContinue = () => {
    const correctCount = selectedWords.filter(w => wordSet.targets.includes(w)).length;
    const penalty = selectedWords.filter(w => !wordSet.targets.includes(w)).length;
    let rawScore = correctCount - (penalty * 0.5);
    if (rawScore < 0) rawScore = 0;
    const finalScore = Math.min((rawScore / wordSet.targets.length) * 10, 10);
    updateScore('memory_score', parseFloat(finalScore.toFixed(1)));
    if (phase === 'recall') setPhase('done');
    else navigate('/test/attention');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-8 px-4 font-sans text-white selection:bg-lime-400 selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex-shrink-0" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center w-full">
        <TestNav />
      </div>

      <div className="w-full max-w-3xl flex justify-between items-end mb-4 px-2 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-lime-400 rounded-xl flex items-center justify-center text-2xl shadow-sm">🧠</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">Memory Test<span className="text-lime-400">.</span></h1>
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Test 1 of 4</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl h-3 bg-white/5 border border-white/10 rounded-full mb-8 overflow-hidden shadow-inner relative z-10">
        <div className="h-full bg-lime-400 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(163,230,53,0.5)]"
             style={{ width: phase === 'done' ? '25%' : phase === 'recall' ? '20%' : phase === 'study' ? '10%' : '5%' }}>
        </div>
      </div>

      <div ref={cardRef} className="w-full max-w-3xl bg-[#111] rounded-3xl shadow-2xl border border-white/10 p-8 relative z-10 backdrop-blur-md">

        {/* ─── INTRO PHASE ─── */}
        {phase === 'intro' && (
          <div className="text-center py-6">
            <h2 className="intro-item text-3xl font-black mb-3 text-white tracking-tight">Word Memorization</h2>
            <p className="intro-item text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              You will be shown a series of <strong className="text-white">8 words</strong>, one by one. You will have 2 seconds to memorize each word. Afterwards, you will need to identify them from a larger list.
            </p>

            <div className="intro-item flex gap-4 justify-center text-sm text-white/50 mb-8">
              <div className="bg-lime-400/10 border border-lime-400/20 text-lime-400 px-4 py-2 rounded-lg font-bold shadow-sm">🧠 8 words to memorize</div>
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-lg font-bold shadow-sm">⏱ 2s per word</div>
            </div>

            <button
              onClick={() => setPhase('study')}
              className="intro-item bg-lime-400 hover:bg-lime-300 text-black font-extrabold py-4 px-12 rounded-full transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 hover:-translate-y-0.5"
            >
              Start Memorization →
            </button>
          </div>
        )}

        {/* ─── STUDY PHASE ─── */}
        {phase === 'study' && (
          <div className="text-center py-16">
            <p className="text-lime-400 font-bold mb-4 uppercase tracking-widest text-sm">Memorize this word</p>
            <div className="h-32 flex items-center justify-center">
               <h2 key={studyIndex} className="study-word text-6xl md:text-8xl font-black text-white tracking-tighter">
                 {wordSet.targets[studyIndex]}
               </h2>
            </div>
            <p className="text-white/40 mt-8 font-bold uppercase tracking-widest text-sm">Word {studyIndex + 1} of {wordSet.targets.length}</p>
          </div>
        )}

        {/* ─── RECALL PHASE ─── */}
        {phase === 'recall' && (
          <div>
            <h2 className="text-2xl font-black mb-1 text-white tracking-tight">Select the Words You Memorized</h2>
            <p className="text-white/50 mb-8">Click on all the words that were shown in the previous step.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {wordSet.allWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => toggleWord(word)}
                  style={{ opacity: 1, visibility: 'visible' }}
                  className={`word-btn py-4 px-2 rounded-xl border-2 text-sm font-black tracking-wider transition-all duration-200 ${
                    selectedWords.includes(word)
                      ? 'bg-lime-400 border-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.3)] scale-105'
                      : 'bg-[#1a1a1a] border-white/10 text-white hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 text-white rounded-xl p-4 mb-6 text-sm font-medium flex justify-between items-center">
              <span>Selected: <strong className="text-lime-400 text-lg">{selectedWords.length}</strong> words</span>
              {selectedWords.length === wordSet.targets.length && <span className="text-lime-400 font-bold uppercase tracking-widest text-xs">Perfect amount!</span>}
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-white text-black font-extrabold py-4 rounded-full transition-all shadow-lg hover:bg-slate-200 flex items-center justify-center gap-2"
            >
              Submit Answers <span className="text-xl">›</span>
            </button>
          </div>
        )}

        {/* ─── DONE PHASE ─── */}
        {phase === 'done' && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-[0_0_30px_rgba(163,230,53,0.2)]">✓</div>
            <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Memory Test Complete!</h2>
            <p className="text-white/50 mb-8">Your answers have been recorded for analysis.</p>

            <button
              onClick={() => navigate('/test/attention')}
              className="w-full bg-lime-400 hover:bg-lime-300 text-black font-extrabold py-4 rounded-full transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 flex items-center justify-center gap-2"
            >
              Continue to Attention Test <span className="text-xl">›</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MemoryTest;
