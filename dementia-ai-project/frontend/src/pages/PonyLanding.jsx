import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import memoryThumb from '../assets/memory.jpg';
import attentionThumb from '../assets/Selective Attention.jpg';
import clockThumb from '../assets/Executive Function.jpg';
import visualThumb from '../assets/Visuospatial Function.jpg';
import HeroCanvas from '../components/HeroCanvas';
import Ballpit from '../components/Ballpit';

const featuredCompanies = [
  {
    name: 'GLX Analytix ApS',
    tagline: 'The GLX Signature Test',
    description: 'GLX Analytix is developing a novel blood test designed for the early diagnosis and monitoring of Alzheimer\'s Disease. The company\'s technology focuses on detecting damage to the blood-brain barrier (BBB) by analyzing the endothelial glycocalyx (GLX), a protective layer of cells lining the blood vessels. Their test uses a proprietary immunoassay and machine learning to create a composite biomarker called the GLX Signature, which aims to identify inflammation and neurodegeneration earlier than current methods.',
    focus: 'Early detection of Alzheimer\'s and vascular pathology through a liquid biopsy.',
    link: 'https://www.alzdiscovery.org/research/glx-analytix-aps',
    linkLabel: 'Alzheimer\'s Drug Discovery Foundation',
  },
  {
    name: 'NITech & Chubu Electric',
    tagline: '"Mimamori Plus" Wandering Detection System',
    description: 'In a collaborative effort, the Nagoya Institute of Technology (NITech) and Chubu Electric Power Co., Inc. have developed "Mimamori Plus," a system designed to monitor and detect wandering behaviors in seniors suffering from dementia. The system uses IoT technology, combining radio wave transmitters carried by individuals with stationary receivers installed on utility poles. Smartphones and computers can then track location data, and AI is used to analyze movement patterns to identify potential wandering incidents caused by dementia.',
    focus: 'AI-driven monitoring and safety solutions for dementia-related wandering.',
    link: 'https://www.chuden.co.jp/english/',
    linkLabel: 'Chubu Electric Power Press Release',
  },
];

const PonyLanding = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-lime-400 selection:text-black relative overflow-hidden">
      
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-white/10">
        <div className="text-xl font-black tracking-tighter">
          EarlyDementia<span className="text-lime-400">.</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/60">
          <span onClick={() => navigate('/test/memory')} className="hover:text-white transition-colors cursor-pointer">Assessment</span>
          <span onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">Dashboard</span>
          <span onClick={() => navigate('/results')} className="hover:text-white transition-colors cursor-pointer">Results</span>
        </div>
        <button onClick={() => navigate('/login')} className="btn-rainbow">
          <div>
            <span>Patient Login</span>
          </div>
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full z-10 pt-48 pb-32 px-8 flex flex-col items-center justify-center text-center min-h-[90vh]">
        <HeroCanvas />
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-block border border-lime-400/30 bg-lime-400/10 text-lime-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8">
            Focus on Early Intervention
          </div>
        <h1 className="flex flex-col items-center mb-8">
          <span className="flyIn lineOne text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-tight">Early</span>
          <span className="flyIn lineTwo text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Dementia</span>
        </h1>
        <p className="flyIn lineThree text-lg md:text-xl text-white/50 max-w-2xl font-medium mb-4 italic px-4">
          "Pick it up long before it is a problem."
        </p>
        <div className="flyIn lineFour">
          — <strong className="text-black">Rodney Swenson, PhD</strong>, UND
        </div>
        <div className="flex gap-4">
            <button onClick={() => navigate('/signup')} className="btn-rainbow scale-110">
              <div>
                <span>Start Free Assessment</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Featured Companies — Auto-scrolling Marquee */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 py-10 overflow-hidden backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 text-center font-bold">Featured Companies & Research</p>
        <div className="relative w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <div className="flex animate-marquee hover:[animation-play-state:paused]">
            {[...featuredCompanies, ...featuredCompanies, ...featuredCompanies, ...featuredCompanies, ...featuredCompanies, ...featuredCompanies].map((company, i) => (
              <button
                key={i}
                onClick={() => setSelectedCompany(company)}
                className="text-xl md:text-2xl font-black tracking-tighter text-white/40 hover:text-lime-400 transition-colors duration-300 flex-shrink-0 cursor-pointer mx-10"
              >
                {company.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedCompany(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
          <div
            className="relative bg-[#141414] border border-white/10 rounded-3xl max-w-2xl w-full p-8 md:p-10 shadow-2xl shadow-black/50 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedCompany(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-lg"
            >
              ✕
            </button>

            {/* Badge */}
            <div className="inline-block mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-lime-400/15 text-lime-400 border border-lime-400/30">
                Featured Research
              </span>
            </div>

            {/* Title */}
            <h3 className="text-3xl font-black tracking-tight text-white mb-2">{selectedCompany.name}</h3>
            <p className="text-lime-400 font-bold text-sm mb-6">{selectedCompany.tagline}</p>

            {/* Description */}
            <p className="text-white/60 leading-relaxed mb-6">{selectedCompany.description}</p>

            {/* Key Focus */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-xs uppercase tracking-widest text-white/30 font-bold mb-1">Key Focus</p>
              <p className="text-white/80 font-medium">{selectedCompany.focus}</p>
            </div>

            {/* Link */}
            <a
              href={selectedCompany.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 rounded-full font-bold text-sm transition-colors"
            >
              {selectedCompany.linkLabel} <span>↗</span>
            </a>
          </div>
        </div>
      )}

      {/* Case Studies Grid */}
      <section className="relative py-32 overflow-hidden">
        {/* Ballpit Background Backdrop */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <Ballpit
            count={80}
            gravity={0}
            friction={1}
            wallBounce={1}
            followCursor={false}
            colors={["#1c680d", "#0ab607", "#0b6547"]}
          />
        </div>

        <div className="relative z-10 px-8 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-16">Selected Cases<span className="text-lime-400">.</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: 'Memory Encoding', desc: 'Measures immediate and delayed recall through interactive word selection.', tag: 'Cognitive Test', image: memoryThumb, path: '/test/memory' },
            { title: 'Selective Attention', desc: 'Evaluates focus and reaction time via automated rapid Stroop testing.', tag: 'Cognitive Test', image: attentionThumb, path: '/test/attention' },
            { title: 'Executive Function', desc: 'Tests complex planning and spatial organization through digital clock-drawing.', tag: 'Cognitive Test', image: clockThumb, path: '/test/clock-drawing' },
            { title: 'Visuospatial Function', desc: 'Assesses spatial awareness through interactive 4x4 pattern recognition tasks.', tag: 'Cognitive Test', image: visualThumb, path: '/test/visual-spatial' }
          ].map((caseItem, i) => (
            <div key={i} className="group cursor-pointer" onClick={() => navigate(caseItem.path)}>
              <div className="bg-[#141414] border border-white/5 rounded-2xl aspect-[4/3] mb-6 overflow-hidden relative transition-all duration-500 group-hover:border-lime-400/30 group-hover:shadow-[0_0_30px_rgba(163,230,53,0.1)]">
                {/* Actual Image */}
                <img src={caseItem.image} alt={caseItem.title} className="absolute inset-0 w-full h-full object-cover object-top opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90"></div>
                <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-end opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-lime-400 font-bold bg-lime-400/10 px-4 py-2 rounded-full text-sm backdrop-blur-md border border-lime-400/20">
                    Start Test →
                  </span>
                </div>
              </div>
              <p className="text-lime-400 text-sm font-bold tracking-widest uppercase mb-2">{caseItem.tag}</p>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-lime-400 transition-colors">{caseItem.title}</h3>
              <p className="text-white/50">{caseItem.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* Testimonials */}
      <section className="relative z-10 py-32 bg-[#111] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-center">What Experts Say<span className="text-lime-400">.</span></h2>
          <p className="text-white/40 text-center mb-16 max-w-xl mx-auto">Leading researchers and clinicians pioneering AI-driven dementia detection. Click a card to learn more.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'StateViewer reflects that commitment — a step toward earlier understanding, more precise treatment and, one day, changing the course of these diseases.',
                name: 'Dr. David Jones, M.D.',
                shortTitle: 'Neurologist, Mayo Clinic',
                fullTitle: 'Neurologist, Director of the Neurology Artificial Intelligence Program at Mayo Clinic',
                bio: 'Lead developer of StateViewer, an AI tool that helps clinicians identify brain activity patterns linked to nine types of dementia with 88% accuracy, enabling clinicians to interpret brain scans nearly twice as fast and with up to three times greater accuracy.',
                links: [
                  { label: 'Published Research (Neurology, 2025)', url: 'https://n.neurology.org/content/early/2025/01/15/10.1212/WNL.0000000000213296' },
                  { label: 'Mayo Clinic Faculty Profile', url: 'https://www.mayo.edu/research/faculty/jones-david-t-m-d/bio-00027785' },
                ],
                accent: 'lime',
              },
              {
                quote: 'We are finding more and more evidence that Alzheimer\'s is possible to detect early, during a window when treatments may be more effective.',
                name: 'Dr. Michael I. Miller, Ph.D.',
                shortTitle: 'Director, BME, Johns Hopkins',
                fullTitle: 'Director, Department of Biomedical Engineering, Johns Hopkins University',
                bio: 'Pioneer in early detection of Alzheimer\'s using MRI. His landmark 2014 NIH study demonstrated that MRI scans can detect brain changes linked to Alzheimer\'s more than 10 years before symptoms appear.',
                links: [
                  { label: 'Published Research (Johns Hopkins ICTR)', url: 'https://ictr.johnshopkins.edu/research_saves_lives/earlier-better-treatments-for-alzheimers-disease/' },
                  { label: 'Johns Hopkins BME Faculty Page', url: 'https://www.bme.jhu.edu/people/faculty/michael-i-miller/' },
                ],
                accent: 'cyan',
              },
              {
                quote: 'We aren\'t just building gadgets. We\'re creating scalable solutions to meet older adults where they are — in their homes, or senior centers or their doctor\'s office.',
                name: 'Dr. Peter Abadir, M.D.',
                shortTitle: 'Geriatrician, Johns Hopkins',
                fullTitle: 'Geriatrician, Co-Director of the Johns Hopkins Human Aging Project',
                bio: 'Leads the Artificial Intelligence & Technology Collaboratory for Aging Research (AITC), a $20 million NIH-funded initiative developing technology-driven solutions for aging adults, including early detection of neurodegenerative decline.',
                links: [
                  { label: 'Johns Hopkins Medicine Faculty Page', url: 'https://www.hopkinsmedicine.org/profiles/details/peter-abadir' },
                  { label: 'AITC Program', url: 'https://aitc.jhu.edu/' },
                ],
                accent: 'amber',
              }
            ].map((expert, i) => {
              const accentMap = {
                lime: { bg: 'bg-lime-400/10', border: 'border-lime-400/20', text: 'text-lime-400', hoverBorder: 'hover:border-lime-400/40', shadow: 'hover:shadow-[0_0_30px_rgba(163,230,53,0.08)]' },
                cyan: { bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', text: 'text-cyan-400', hoverBorder: 'hover:border-cyan-400/40', shadow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.08)]' },
                amber: { bg: 'bg-amber-400/10', border: 'border-amber-400/20', text: 'text-amber-400', hoverBorder: 'hover:border-amber-400/40', shadow: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.08)]' },
              };
              const a = accentMap[expert.accent];
              return (
                <div
                  key={i}
                  onClick={() => setSelectedExpert(expert)}
                  className={`bg-[#1a1a1a] p-8 rounded-2xl border ${a.border} ${a.hoverBorder} ${a.shadow} transition-all duration-300 cursor-pointer group`}
                >
                  <div className={`${a.text} text-4xl leading-none font-serif mb-4`}>"</div>
                  <p className="text-lg text-white/80 font-medium mb-8 leading-relaxed">
                    {expert.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${a.bg} border ${a.border} rounded-full flex items-center justify-center ${a.text} font-black text-lg flex-shrink-0`}>
                      {expert.name.split(' ')[1]?.charAt(0) || expert.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{expert.name}</h4>
                      <p className={`text-sm ${a.text}`}>{expert.shortTitle}</p>
                    </div>
                  </div>
                  <div className={`mt-5 pt-4 border-t border-white/5 flex items-center justify-between`}>
                    <span className="text-xs text-white/30 font-bold uppercase tracking-widest">View Full Profile</span>
                    <span className={`${a.text} text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Credits */}
          <p className="text-center text-xs text-white/20 mt-12 max-w-2xl mx-auto leading-relaxed">
            All expert quotes, credentials, and research links are attributed to their respective authors and institutions.
            Content sourced from publicly available academic profiles, press releases, and published peer-reviewed research.
          </p>
        </div>
      </section>

      {/* Expert Detail Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedExpert(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
          <div
            className="relative bg-[#141414] border border-white/10 rounded-3xl max-w-2xl w-full p-8 md:p-10 shadow-2xl shadow-black/50 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modalIn 0.3s ease-out' }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedExpert(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-lime-400/10 border-2 border-lime-400/30 rounded-2xl flex items-center justify-center text-lime-400 font-black text-2xl">
                {selectedExpert.name.split(' ')[1]?.charAt(0) || selectedExpert.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">{selectedExpert.name}</h3>
                <p className="text-lime-400 font-semibold text-sm">{selectedExpert.fullTitle}</p>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="text-lime-400 text-3xl leading-none font-serif mb-2">"</div>
              <p className="text-white/70 leading-relaxed italic">{selectedExpert.quote}"</p>
            </div>

            {/* Bio */}
            <p className="text-white/60 leading-relaxed mb-6">{selectedExpert.bio}</p>

            {/* Research Links */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-white/30 font-bold mb-2">Published Research & Profiles</p>
              {selectedExpert.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white/5 border border-white/10 hover:border-lime-400/30 rounded-xl p-4 group/link transition-all duration-300"
                >
                  <span className="text-white/80 font-medium text-sm group-hover/link:text-lime-400 transition-colors">{link.label}</span>
                  <span className="text-lime-400 text-lg opacity-60 group-hover/link:opacity-100 transition-opacity">↗</span>
                </a>
              ))}
            </div>

            {/* Attribution */}
            <p className="text-[10px] text-white/20 mt-6 leading-relaxed">
              Information sourced from publicly available institutional profiles and published peer-reviewed research. All rights belong to the respective authors and institutions.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-24 px-8 max-w-7xl mx-auto border-t border-white/10 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-black tracking-tighter mb-6">EarlyDementia<span className="text-lime-400">.</span></h2>
            <p className="text-white/50 max-w-sm mb-8">
              An AI-powered cognitive health screening platform. Detect early signs of dementia through interactive assessments backed by clinical research.
            </p>
            <p className="text-xs text-white/30">© {new Date().getFullYear()} EarlyDementia AI. For screening purposes only — not a medical diagnosis.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
            <div className="flex flex-col gap-4 text-white/50 font-medium">
              <span onClick={() => navigate('/test/memory')} className="hover:text-lime-400 transition-colors w-fit cursor-pointer">Start Assessment</span>
              <span onClick={() => navigate('/dashboard')} className="hover:text-lime-400 transition-colors w-fit cursor-pointer">Dashboard</span>
              <span onClick={() => navigate('/results')} className="hover:text-lime-400 transition-colors w-fit cursor-pointer">View Results</span>
              <span onClick={() => navigate('/profile')} className="hover:text-lime-400 transition-colors w-fit cursor-pointer">Profile</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Resources</h4>
            <div className="flex flex-col gap-4 text-white/50 font-medium">
              <a href="https://www.alz.org" target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors w-fit">Alzheimer's Association ↗</a>
              <a href="https://www.nia.nih.gov/health/alzheimers" target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors w-fit">NIH Alzheimer's Info ↗</a>
              <span onClick={() => navigate('/login')} className="hover:text-lime-400 transition-colors w-fit cursor-pointer">Sign In</span>
              <span onClick={() => navigate('/signup')} className="hover:text-lime-400 transition-colors w-fit cursor-pointer">Create Account</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Contact</h4>
            <div className="flex flex-col gap-4 text-white/50 font-medium">
              <a href="https://www.instagram.com/_.subham._13?igsh=aGlkeWx3NXFpZmZh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-lime-400 transition-colors w-fit group">
                <span className="text-lg">📸</span> _.subham._13
              </a>
              <a href="mailto:subhapattnaik01@gmail.com" className="flex items-center gap-2 hover:text-lime-400 transition-colors w-fit">
                <span className="text-lg">✉️</span> subhapattnaik01@gmail.com
              </a>
              <a href="tel:9692727370" className="flex items-center gap-2 hover:text-lime-400 transition-colors w-fit font-mono tracking-tighter">
                <span className="text-lg">📞</span> +91 9692727370
              </a>
              <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest font-bold">Personal Design & Development</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PonyLanding;
