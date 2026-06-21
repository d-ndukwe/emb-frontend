import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LeadForm from './LeadForm';

// ─── Design tokens (mirrors LeadForm palette) ────────────────────────────────
// Navy:  #0E3A8C  │  Deep: #071f55  │  Darkest: #040f2e
// Gold:  #F5C700  │  Lime: #C8DC00
// White: #FFFFFF  │  Muted: rgba(255,255,255,0.55)



// ─── Gold accent bar ──────────────────────────────────────────────────────────
function GoldBar({ width = 'w-10' }: { width?: string }) {
  return <div className={`${width} h-0.5 bg-[#F5C700] rounded-full`} />;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-white/10 rounded-2xl p-5 bg-white/4 backdrop-blur-sm flex flex-col gap-1">
      <span
        className="text-4xl font-black text-[#F5C700] leading-none"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {value}
      </span>
      <span className="text-sm text-white/55 leading-snug">{label}</span>
    </div>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [formOpen, setFormOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (formOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [formOpen]);

  return (
    <div
      className="min-h-screen text-white antialiased"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: 'linear-gradient(160deg,#0E3A8C 0%,#071f55 50%,#040f2e 100%)',
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');
        html { scroll-behavior: smooth; }
        :focus-visible { outline: 2px solid #F5C700; outline-offset: 3px; border-radius: 4px; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }

        /* Subtle grid texture overlay */
        .bg-grid::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #040f2e; }
        ::-webkit-scrollbar-thumb { background: rgba(245,199,0,0.4); border-radius: 3px; }

        /* Animated gradient orbs */
        @keyframes float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-24px) scale(1.04); } }
        @keyframes floatB { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(18px) scale(0.97); } }
        .orb-a { animation: float 9s ease-in-out infinite; }
        .orb-b { animation: floatB 12s ease-in-out infinite; }

        /* Ticker */
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 28s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#071f55]/90 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-black/20' : ''
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo mark */}
          <a href="#" className="flex items-center gap-2.5" aria-label="EMB Trade Logistics home">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#F5C700', boxShadow: '0 0 0 2px rgba(245,199,0,0.3)' }}
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="7" stroke="#0E3A8C" strokeWidth="1.5" fill="none" />
                <ellipse cx="12" cy="10" rx="3.5" ry="7" stroke="#0E3A8C" strokeWidth="1.2" fill="none" />
                <line x1="5" y1="10" x2="19" y2="10" stroke="#0E3A8C" strokeWidth="1.2" />
                <path d="M4 18 Q12 14 20 18 L18.5 21 Q12 17 5.5 21Z" fill="#0E3A8C" />
                <polygon points="12,7 10.5,17.5 13.5,17.5" fill="#0E3A8C" opacity="0.5" />
              </svg>
            </div>
            <div className="leading-none">
              <p className="text-white font-black text-[13px] tracking-[0.06em]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                EMB TRADE LOGISTICS
              </p>
              <p className="text-[#F5C700] text-[9px] tracking-[0.14em] uppercase">Nigeria Limited</p>
            </div>
          </a>

          <div className="hidden md:block">
            <button
              onClick={() => setFormOpen(true)}
              className="bg-[#F5C700] hover:bg-[#ffd000] text-[#0E3A8C] font-bold py-2.5 px-5 rounded-xl text-sm tracking-wide transition-all duration-200 hover:shadow-[0_4px_20px_rgba(245,199,0,0.35)] hover:-translate-y-px active:translate-y-0"
            >
              Get a Quote
            </button>
          </div>
        </nav>
      </header>

     {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[100dvh] min-h-[700px] flex flex-col justify-center overflow-hidden px-6">
        
        {/* We moved the grid background into its own absolute layer so it perfectly covers the new height */}
        <div className="absolute inset-0 bg-grid pointer-events-none"></div>

        {/* Atmospheric orbs */}
        <div className="orb-a absolute top-10 right-[8%] w-72 h-72 rounded-full pointer-events-none opacity-[0.12]" style={{ background: 'radial-gradient(circle, #F5C700, transparent 70%)' }} />
        <div className="orb-b absolute bottom-0 left-[5%] w-96 h-96 rounded-full pointer-events-none opacity-[0.07]" style={{ background: 'radial-gradient(circle, #C8DC00, transparent 70%)' }} />

        {/* The mt-16 exactly matches your h-16 navbar, perfectly centering the content in the remaining space */}
        <div className="max-w-7xl w-full mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center mt-16">
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              FUEL.<br />
              FERTILIZER.<br />
              <span className="text-[#F5C700]">DELIVERED.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              style={{ originX: 0 }}
              className="mb-5"
            >
              <GoldBar width="w-14" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white/60 text-base leading-relaxed max-w-md mb-8"
            >
              EMB Trade Logistics connects Nigerian businesses with bulk fuel, gas, fertilizers,
              and materials. They are sourced fast, priced competitively, delivered reliably.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => setFormOpen(true)}
                className="bg-[#F5C700] hover:bg-[#ffd000] text-[#0E3A8C] font-bold py-3.5 px-7 rounded-xl text-sm tracking-wide transition-all duration-200 hover:shadow-[0_6px_24px_rgba(245,199,0,0.4)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Request a Quote
              </button>
              <a
                href="#products"
                className="border border-white/20 hover:border-white/40 text-white/75 hover:text-white font-medium py-3.5 px-7 rounded-xl text-sm transition-all duration-200"
              >
                View Products ↓
              </a>
            </motion.div>
          </div>

          {/* Right: stat cards */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-3"
          >
            <StatCard value="500M+" label="Litres sourced across Nigeria" />
            <StatCard value="48hr" label="Average quote-to-delivery" />
            <StatCard value="11+" label="Product categories available" />
            <StatCard value="100%" label="Verified supplier network" />
          </motion.div>
        </div>
      </section>

      {/* ── SCROLLING TICKER ─────────────────────────────────────────────── */}
      <div className="border-y border-white/8 bg-white/3 py-3 overflow-hidden" aria-hidden="true">
        <div className="ticker-track flex gap-10 whitespace-nowrap w-max">
          {[...Array(2)].map((_, r) =>
            ['EN590 Diesel', 'AGO Diesel', 'PMS Petrol', 'Jet A1 Fuel', 'LPG Gas', 'LNG Gas',
              'Urea Fertilizer', 'Indorama Fertilizer', 'Cement', 'Building Materials', 'Agricultural Products',
            ].map((item, i) => (
              <span key={`${r}-${i}`} className="text-sm text-white/40 font-medium tracking-widest uppercase flex items-center gap-4">
                {item}
                <span className="text-[#F5C700]/60 text-xs">✦</span>
              </span>
            ))
          )}
        </div>
      </div>
     
      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] py-10 px-6" id="contact">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: '#F5C700' }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="7" stroke="#0E3A8C" strokeWidth="1.5" fill="none" />
                <ellipse cx="12" cy="10" rx="3.5" ry="7" stroke="#0E3A8C" strokeWidth="1.2" fill="none" />
                <line x1="5" y1="10" x2="19" y2="10" stroke="#0E3A8C" strokeWidth="1.2" />
                <path d="M4 18 Q12 14 20 18 L18.5 21 Q12 17 5.5 21Z" fill="#0E3A8C" />
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-[0.06em]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                EMB TRADE LOGISTICS NIG. LTD.
              </p>
              <p className="text-white/40 text-xs mt-1 max-w-xs leading-relaxed">
                Bulk commodity sourcing &amp; logistics across Nigeria and West Africa.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] tracking-widest uppercase text-white/30 mb-1">Contact</p>
            <a
              href="https://wa.me/2348033548557"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 hover:text-[#F5C700] transition-colors flex items-center gap-2"
            >
              <span>💬</span> WhatsApp
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/[0.07] mt-8 pt-6 flex flex-col md:flex-row justify-between gap-2">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} EMB Trade Logistics Nig. Ltd. All rights reserved.</p>
          <p className="text-xs text-white/25">RC Number: Nigeria CAC Registered</p>
        </div>
      </footer>
    </div>
  );
}