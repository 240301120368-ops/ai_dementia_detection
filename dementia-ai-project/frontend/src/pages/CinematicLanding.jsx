import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CinematicLanding = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Total frames expected in the "cell explosion hero page" folder
  const totalFrames = 120;
  const [images, setImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Scroll tracking setup
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate exactly which frame should be showing based on scroll progress (0 to 1)
  const rawFrameIndex = useTransform(scrollYProgress, [0, 1], [1, totalFrames]);
  
  // Apply a subtle spring so the frame interpolation feels "buttery smooth" and Apple-like, reducing stutter
  const springFrameIndex = useSpring(rawFrameIndex, {
    stiffness: 150,
    damping: 30,
    restDelta: 0.001
  });

  // Opacities for the storytelling sections
  // 0-15% Hero
  const opacityHero = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  
  // 15-40% Membrane Reveal
  const opacityMembrane = useTransform(scrollYProgress, [0.15, 0.25, 0.35, 0.45], [0, 1, 1, 0]);
  const yMembrane = useTransform(scrollYProgress, [0.15, 0.25], [50, 0]);

  // 40-65% Collision & Division
  const opacityCollision = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.7], [0, 1, 1, 0]);
  const yCollision = useTransform(scrollYProgress, [0.4, 0.5], [50, 0]);

  // 65-85% Nucleus
  const opacityNucleus = useTransform(scrollYProgress, [0.65, 0.75, 0.85, 0.9], [0, 1, 1, 0]);
  const yNucleus = useTransform(scrollYProgress, [0.65, 0.75], [50, 0]);

  // 85-100% Reassembly
  const opacityReassemble = useTransform(scrollYProgress, [0.85, 0.95, 1], [0, 1, 1]);
  const yReassemble = useTransform(scrollYProgress, [0.85, 0.95], [50, 0]);

  // Top Nav background blur transition
  const navBackground = useTransform(
    scrollYProgress,
    [0, 0.05],
    ["rgba(2, 8, 4, 0)", "rgba(2, 8, 4, 0.75)"]
  );
  const navBackdropBlur = useTransform(
    scrollYProgress,
    [0, 0.05],
    ["blur(0px)", "blur(12px)"]
  );

  // Preload images logic
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];
    let loadFailed = false;

    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        // Zero-pads number to 4 chars e.g. 0001, depending on standard sequence logic.
        // Assuming user uses standard naming like frame_0001.webp or 0001.webp
        const num = i.toString().padStart(4, '0');
        img.src = `/cell explosion hero page/${num}.webp`; // Adjust extension if the user provides jpeg/png!

        img.onload = () => {
          loadedImages[i] = img;
          loadedCount++;
          if (loadedCount === totalFrames) {
            setImages(loadedImages);
            setImagesLoaded(true);
          }
        };

        img.onerror = () => {
           // If we can't find webp, try png fallback (silent fail since we build a canvas fallback)
           if (!loadFailed) {
              loadFailed = true;
              console.warn("Could not load image sequence frames from /cell explosion hero page/");
           }
        };
    }
  }, []);

  // Frame painting logic driven by scroll
  useMotionValueEvent(springFrameIndex, "change", (latestFrame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const frameNumber = Math.max(1, Math.min(totalFrames, Math.round(latestFrame)));

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (imagesLoaded && images[frameNumber]) {
      // Draw actual loaded image sequence covering the entire canvas while preserving aspect ratio
      const img = images[frameNumber];
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      
      ctx.fillStyle = "#020804";
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Match background
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    } else {
      // PREMIUM CANVAS FALLBACK (renders if images aren't present yet)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#020804";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const progress = scrollYProgress.get(); // 0 to 1

      // Very simple simulated cell division logic for visual awe
      const spread = progress < 0.5 ? progress * 600 : (1 - progress) * 600;
      const glowScale = progress < 0.5 ? 1 + progress * 2 : 1 + (1 - progress) * 2;
      
      const drawCell = (xOffset, yOffset, size, color) => {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(cx + xOffset, cy + yOffset, 0, cx + xOffset, cy + yOffset, size);
        gradient.addColorStop(0, color);
        // Fade perfectly to background color #020804 to ensure no hard edges
        gradient.addColorStop(1, "rgba(2, 8, 4, 0)"); 
        ctx.fillStyle = gradient;
        ctx.arc(cx + xOffset, cy + yOffset, size, 0, Math.PI * 2);
        ctx.fill();
      };

      // Nucleus
      ctx.globalCompositeOperation = 'screen';
      drawCell(-spread * 0.5, -spread * 0.2, 100 * glowScale, "rgba(0, 214, 255, 0.4)"); 
      drawCell(spread * 0.5, spread * 0.2, 110 * glowScale, "rgba(0, 255, 102, 0.4)"); 
      
      // Outer membrane
      drawCell(0, spread * 0.3, 180 * glowScale, "rgba(0, 255, 102, 0.2)");
      drawCell(0, -spread * 0.3, 160 * glowScale, "rgba(6, 182, 212, 0.15)");
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  return (
    <div ref={containerRef} className="bg-[#020804] text-white min-h-[400vh] relative font-sans">
      
      {/* Subtle Radial Hero Gradient (as requested) */}
      <div className="fixed inset-0 pointer-events-none z-0" 
           style={{ background: 'radial-gradient(circle at 50% 50%, #04120A 0%, #020804 70%)' }}>
      </div>

      {/* STICKY APPLE-STYLE NAVBAR */}
      <motion.nav 
        style={{ backgroundColor: navBackground, backdropFilter: navBackdropBlur }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5 border-b border-white/5 transition-all duration-300"
      >
        <div className="text-xl font-medium tracking-tight">Lumina Bio</div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/60">
          <span className="hover:text-white hover:underline decoration-[#00FF66] underline-offset-4 transition-all cursor-pointer">Overview</span>
          <span className="hover:text-white hover:underline decoration-[#00FF66] underline-offset-4 transition-all cursor-pointer">Morphology</span>
          <span className="hover:text-white hover:underline decoration-[#00FF66] underline-offset-4 transition-all cursor-pointer">Division</span>
          <span className="hover:text-white hover:underline decoration-[#00FF66] underline-offset-4 transition-all cursor-pointer">Structures</span>
          <span className="hover:text-white hover:underline decoration-[#00FF66] underline-offset-4 transition-all cursor-pointer">Explore</span>
        </div>
        
        <button 
          onClick={() => navigate('/test/memory')}
          className="relative overflow-hidden group px-6 py-2 rounded-full text-sm font-semibold text-white bg-transparent border border-white/10 hover:border-[#00FF66]/50 shadow-[0_0_15px_rgba(0,255,102,0)] hover:shadow-[0_0_15px_rgba(0,255,102,0.2)] transition-all duration-500"
        >
          <span className="relative z-10">View Research</span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FF66]/10 to-[#00D6FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>
      </motion.nav>

      {/* STICKY CANVAS WRAPPER */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-10">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover"></canvas>
        
        {/* STORYTELLING BEATS (OVERLAYS) */}
        
        {/* 1. Hero (0-15%) */}
        <motion.div style={{ opacity: opacityHero }} className="absolute inset-0 flex flex-col justify-center items-center text-center pointer-events-none z-20">
          <h1 className="flex flex-col items-center mb-4">
            <span className="flyIn lineOne text-6xl md:text-8xl font-bold tracking-tighter">Cellular</span>
            <span className="flyIn lineTwo text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00FF66]/80">Dynamics</span>
          </h1>
          <p className="flyIn lineThree text-xl md:text-3xl font-medium text-white/90 mb-6 tracking-tight">Life, visualized.</p>
          <div className="flyIn lineFour max-w-lg mx-auto">
            A cinematic exploration of organic structures.
          </div>
        </motion.div>

        {/* 2. Membrane Reveal (15-40%) */}
        <motion.div style={{ opacity: opacityMembrane, y: yMembrane }} className="absolute inset-y-0 left-10 md:left-24 flex flex-col justify-center pointer-events-none z-20 max-w-md">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Precision at the<br />microscopic level.
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-4">
            Translucent outer membranes and gelatinous textures protect the core.
          </p>
          <p className="text-lg text-white/60 leading-relaxed">
            Every element functions in perfect biological harmony, adapting moment to moment.
          </p>
        </motion.div>

        {/* 3. Collision & Division (40-65%) */}
        <motion.div style={{ opacity: opacityCollision, y: yCollision }} className="absolute inset-y-0 right-10 md:right-24 flex flex-col justify-center items-end text-right pointer-events-none z-20 max-w-md">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Dynamic biological<br />systems.
          </h2>
          <ul className="text-lg text-white/60 leading-relaxed space-y-4 text-right">
            <li className="flex items-center justify-end gap-3">
              Observe real-time cellular collision and division.
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D6FF]"></span>
            </li>
            <li className="flex items-center justify-end gap-3">
              Subsurface scattering reveals complex internal architecture.
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]"></span>
            </li>
            <li className="flex items-center justify-end gap-3">
              Life adapts, separates, and evolves seamlessly.
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]"></span>
            </li>
          </ul>
        </motion.div>

        {/* 4. Nucleus (65-85%) */}
        <motion.div style={{ opacity: opacityNucleus, y: yNucleus }} className="absolute inset-x-0 bottom-24 flex flex-col items-center text-center pointer-events-none z-20 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The core of the structure.
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-2">
            Dense, textured nuclei suspend perfectly within the biological void.
          </p>
          <p className="text-lg text-white/60 leading-relaxed">
            Unlocking the fundamental building blocks of organic life.
          </p>
        </motion.div>

        {/* 5. Reassembly & CTA (85-100%) */}
        <motion.div style={{ opacity: opacityReassemble, y: yReassemble }} className="absolute inset-0 flex flex-col justify-center items-center text-center z-30">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 max-w-4xl leading-tight">
            Understand the building blocks.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">See the whole picture.</span>
          </h1>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Cellular Dynamics. Designed for clarity, visualized for discovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-rainbow scale-125"
            >
              <div>
                <span>Explore the Science</span>
              </div>
            </button>
            <button className="text-white/60 font-medium hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[#00D6FF] px-4 py-2">
              View full methodology
            </button>
          </div>
          <p className="text-xs text-white/30 font-medium tracking-widest uppercase mt-8">
            Engineered for researchers, educators, and the curious.
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default CinematicLanding;
