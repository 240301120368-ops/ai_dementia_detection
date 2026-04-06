import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logo from '../assets/logo.jpg.png';

gsap.registerPlugin(ScrollTrigger);

// ─── Stat Counter Component ───
const StatCounter = ({ value, suffix = '', label }) => {
  const ref = useRef();
  useGSAP(() => {
    const num = { val: 0 };
    gsap.to(num, {
      val: parseFloat(value),
      duration: 2,
      ease: "power2.out",
      scrollTrigger: { trigger: ref.current, start: "top 85%" },
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.floor(num.val) + suffix;
      }
    });
  }, { scope: ref });
  return (
    <div className="text-center">
      <p ref={ref} className="text-4xl md:text-5xl font-extrabold gradient-text">0{suffix}</p>
      <p className="text-sm text-slate-500 mt-2 font-medium">{label}</p>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef();

  useGSAP(() => {
    // ── 1. HERO ENTRANCE: Apple-style staggered reveal ──
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .from(".hero-badge", { y: 20, opacity: 0, duration: 0.8 })
      .from(".hero-headline span", {
        y: 80,
        opacity: 0,
        rotateX: -15,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out"
      }, "-=0.4")
      .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.8 }, "-=0.5")
      .from(".hero-feature-item", { x: -20, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.4")
      .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6, stagger: 0.15 }, "-=0.3")
      .from(".hero-card", {
        scale: 0.85,
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "back.out(1.4)"
      }, "-=0.8")
      .from(".hero-stat", { y: 30, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.5");

    // Floating orbs gentle movement
    gsap.to(".orb-1", { x: 30, y: -20, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".orb-2", { x: -20, y: 15, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".orb-3", { x: 15, y: -30, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });

    // ── 2. HERO CARD 3D TILT ──
    const imageCard = document.querySelector('.hero-card');
    const onMouseMove = (e) => {
      if (!imageCard) return;
      const rect = imageCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(imageCard, {
        rotateY: x * 12,
        rotateX: -y * 12,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power2.out"
      });
    };
    const onMouseLeave = () => {
      gsap.to(imageCard, {
        rotateX: 0, rotateY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
      });
    };
    if (imageCard) {
      imageCard.addEventListener('mousemove', onMouseMove);
      imageCard.addEventListener('mouseleave', onMouseLeave);
    }

    // ── 3. FEATURES SECTION: Scale-up with spring ──
    gsap.from(".feature-card", {
      scrollTrigger: { trigger: "#features-section", start: "top 75%" },
      y: 60,
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.7)"
    });

    // ── 4. STATS SECTION: Slide up ──
    gsap.from(".stats-section", {
      scrollTrigger: { trigger: ".stats-section", start: "top 80%" },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // ── 5. HOW IT WORKS: Draw line + stagger steps ──
    gsap.from(".timeline-progress", {
      scrollTrigger: {
        trigger: "#how-it-works",
        start: "top 60%",
        end: "bottom 60%",
        scrub: 1
      },
      scaleX: 0,
      transformOrigin: "left center",
      ease: "none"
    });

    gsap.from(".step-card", {
      scrollTrigger: { trigger: "#how-it-works", start: "top 70%" },
      y: 50,
      opacity: 0,
      scale: 0.9,
      duration: 0.7,
      stagger: 0.2,
      ease: "back.out(1.4)"
    });

    // ── 6. SCREENING SECTION: Staggered card reveals ──
    gsap.from(".screening-card", {
      scrollTrigger: { trigger: "#screening", start: "top 75%" },
      y: 50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: "power3.out"
    });

    // Section heading reveals
    gsap.utils.toArray('.section-heading').forEach(heading => {
      gsap.from(heading, {
        scrollTrigger: { trigger: heading, start: "top 85%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });
    });

    // ── 7. FOOTER: Gentle reveal ──
    gsap.from("footer > div", {
      scrollTrigger: { trigger: "footer", start: "top 92%" },
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: "power3.out"
    });

    // ── 8. NAVBAR: Hide on scroll down, show on scroll up ──
    let lastScroll = 0;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const nav = document.querySelector('.main-nav');
        if (!nav) return;
        const dir = self.direction;
        if (dir === 1 && self.scroll() > 100) {
          gsap.to(nav, { y: -100, duration: 0.3, ease: "power2.in" });
        } else {
          gsap.to(nav, { y: 0, duration: 0.3, ease: "power2.out" });
        }
      }
    });

    return () => {
      if (imageCard) {
        imageCard.removeEventListener('mousemove', onMouseMove);
        imageCard.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, { scope: containerRef });

  const features = [
    { title: 'AI Detection', icon: '🔍', desc: 'Neural networks trained on 500K+ cognitive samples for precise early detection.' },
    { title: 'Speech Analysis', icon: '🎙️', desc: 'Real-time voice pattern analysis detecting subtle cognitive changes.' },
    { title: 'Secure & Private', icon: '🔒', desc: 'End-to-end encryption with HIPAA-compliant data handling.' }
  ];

  const steps = [
    { num: '01', title: 'Speak Naturally', desc: 'Simply have a conversation — no special equipment needed.', icon: '💬' },
    { num: '02', title: 'AI Analyzes', desc: 'Our neural engine processes speech patterns in real-time.', icon: '⚡' },
    { num: '03', title: 'Pattern Detection', desc: 'Cross-referencing against millions of cognitive markers.', icon: '📊' },
    { num: '04', title: 'Private Report', desc: 'Receive a detailed, encrypted assessment instantly.', icon: '📋' }
  ];

  const screeningItems = [
    { title: 'Speech Analysis Test', desc: 'Evaluates verbal fluency, word recall, and sentence structure.' },
    { title: 'Memory Assessment', desc: 'Tests short-term and working memory through pattern recognition.' },
    { title: 'Cognitive Patterns', desc: 'Detects subtle changes in decision-making and attention.' },
    { title: 'AI Risk Report', desc: 'Comprehensive analysis with confidence scores and recommendations.' }
  ];

  return (
    <div ref={containerRef} className="bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className="main-nav fixed top-0 w-full bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)] z-50 px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center text-xl font-bold tracking-tight cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="Early Dementia Logo" className="h-9 w-9 rounded-lg object-cover" />
          <span className="ml-2.5 text-indigo-900">Early<span className="text-indigo-500">Dementia</span></span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-500">
          <a href="#features-section" className="hover:text-indigo-600 transition-colors duration-300">Features</a>
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors duration-300">How it Works</a>
          <a href="#screening" className="hover:text-indigo-600 transition-colors duration-300">Screening</a>
        </div>
        <button onClick={() => navigate('/login')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5">
          Get Started
        </button>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen pt-28 pb-20 px-6 md:px-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center overflow-hidden">
        {/* Floating Orbs */}
        <div className="orb orb-1" style={{ top: '-5%', right: '10%' }}></div>
        <div className="orb orb-2" style={{ bottom: '20%', left: '-5%' }}></div>
        <div className="orb orb-3" style={{ top: '40%', right: '-10%' }}></div>

        {/* Left Content */}
        <div className="md:w-1/2 space-y-6 relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full border border-indigo-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI-Powered Cognitive Assessment
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900" style={{ perspective: '600px' }}>
            <span className="block">A Gentle Way to</span>
            <span className="block">Check On Your</span>
            <span className="block gradient-text">Cognitive Health</span>
          </h1>

          <p className="hero-subtitle text-lg text-slate-500 max-w-lg leading-relaxed">
            Use your voice for instant AI-powered insights into your brain's health. Compassionate, private, and clinically validated.
          </p>

          <ul className="space-y-2.5 text-slate-600 text-sm font-medium">
            {['Instant Digital Assessment', 'HIPAA Compliant & Secure', 'Voice Pattern Analysis', 'Private AI Report'].map((item, i) => (
              <li key={i} className="hero-feature-item flex items-center gap-2.5">
                <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate('/test/memory')}
              className="hero-cta bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300"
            >
              Begin Free Check-up →
            </button>
            <a
              href="#features-section"
              className="hero-cta bg-white text-slate-700 border border-slate-200 px-7 py-3.5 rounded-full font-bold shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right: Interactive 3D Card */}
        <div className="md:w-1/2 mt-14 md:mt-0 flex justify-center md:justify-end relative z-10">
          <div className="hero-card glass-card p-6 rounded-3xl shadow-2xl w-full max-w-md transition-shadow duration-500 hover:shadow-indigo-100/50 cursor-pointer" style={{ transformStyle: 'preserve-3d' }}>
            <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-2xl p-8 h-72 flex flex-col items-center justify-center border border-indigo-100/50">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-100">
                <span className="text-4xl">🧠</span>
              </div>
              <h2 className="text-xl font-bold text-indigo-900 mb-1">Cognitive Mapping</h2>
              <p className="text-sm text-slate-500 text-center">Real-time neural pathway analysis</p>

              <div className="flex gap-6 mt-6 pt-5 border-t border-indigo-100/60 w-full justify-center">
                <div className="hero-stat text-center">
                  <p className="text-lg font-bold text-indigo-700">98.2%</p>
                  <p className="text-xs text-slate-400">Accuracy</p>
                </div>
                <div className="hero-stat text-center">
                  <p className="text-lg font-bold text-indigo-700">&lt;3min</p>
                  <p className="text-xs text-slate-400">Test Time</p>
                </div>
                <div className="hero-stat text-center">
                  <p className="text-lg font-bold text-indigo-700">500K+</p>
                  <p className="text-xs text-slate-400">Samples</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="stats-section bg-white border-y border-slate-100 py-14">
        <div className="max-w-5xl mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value="98" suffix="%" label="Detection Accuracy" />
          <StatCounter value="500" suffix="K+" label="Samples Analyzed" />
          <StatCounter value="50" suffix="+" label="Research Partners" />
          <StatCounter value="3" suffix="min" label="Average Test Time" />
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features-section" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="section-heading text-center mb-16">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase mb-3">Cutting-Edge Technology</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Advanced Features for <span className="gradient-text">Peace of Mind</span></h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Trained on vast datasets to identify the earliest signs — securely and privately.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div key={i} className="feature-card glass-card p-8 rounded-2xl hover-lift group">
                <div className="w-14 h-14 bg-indigo-50 text-2xl rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors duration-300">{feat.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-indigo-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="section-heading text-center mb-16">
            <p className="text-indigo-300 font-semibold text-sm tracking-widest uppercase mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">How Our AI <span className="text-cyan-400">Works</span></h2>
            <p className="text-indigo-300 mt-4">A simple, four-step process to assess cognitive health.</p>
          </div>

          {/* Timeline Line */}
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-indigo-800 z-0"></div>
            <div className="timeline-progress hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="step-card flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-800 rounded-2xl flex items-center justify-center mb-5 text-2xl border border-indigo-700 shadow-lg shadow-indigo-950/50 timeline-dot-active">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-indigo-400 tracking-widest mb-1">STEP {step.num}</span>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-indigo-300 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SCREENING SECTION ─── */}
      <section id="screening" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="section-heading text-center mb-16">
            <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase mb-3">Comprehensive Testing</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">How We Support Your <span className="gradient-text">Brain Health</span></h2>
            <p className="text-slate-500 mt-4">We look at different aspects of cognition to provide a clearer picture.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {screeningItems.map((item, i) => (
              <div key={i} className="screening-card bg-slate-50 p-7 rounded-2xl border border-slate-100 hover-lift group">
                <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 text-lg font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">{i + 1}</div>
                <h3 className="font-bold text-base mb-2 text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Check Your Cognitive Health?</h2>
          <p className="text-indigo-200 mb-8 text-lg">It takes just 3 minutes. No special equipment needed — just your voice.</p>
          <button
            onClick={() => navigate('/test/memory')}
            className="bg-white text-indigo-700 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            Start Your Free Assessment →
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-50 border-t border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between mb-10">
          <div className="mb-8 md:mb-0 max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
              <h3 className="text-lg font-bold text-indigo-900">EarlyDementia</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">AI-powered tools for early detection of cognitive decline. Compassionate, secure, and clinically validated.</p>
          </div>

          <div className="flex space-x-16">
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600 transition-colors">Home</a></li>
                <li><a href="#features-section" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#screening" className="hover:text-indigo-600 transition-colors">Screening</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>123 Health Tech Ave</li>
                <li>Innovation City, 10101</li>
                <li>contact@earlydementia.ai</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center border-t border-slate-100 pt-8">
          <p className="text-xs text-slate-400 mb-2">
            <b>Disclaimer:</b> This tool is for informational purposes only and is not a substitute for professional medical advice.
          </p>
          <p className="text-xs text-slate-400">© 2026 Early Dementia AI. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;