import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

// Soft white theme
// Page bg      : #f7f8fc
// Card bg      : #ffffff
// Primary      : #3b5bdb  (indigo)
// Accent       : #4dabf7  (light blue)
// Text dark    : #1e2a3a
// Text muted   : #64748b
// Border       : #e8eaf0

/* ── Feature card ----------------------------------------- */
function FeatureCard({ icon, title, description, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaf0] shadow-sm
      hover:shadow-md hover:border-indigo-100 transition-all duration-200 p-6 space-y-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#1e2a3a]">{title}</h3>
      <p className="text-sm text-[#64748b] leading-relaxed">{description}</p>
    </div>
  );
}

/* ── Step card -------------------------------------------- */
function StepCard({ num, title, description, active }) {
  return (
    <div className={`flex flex-col items-center text-center gap-3 p-5 rounded-2xl border
      transition-all duration-300
      ${active
        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
        : 'bg-white border-[#e8eaf0] hover:border-indigo-100'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black
        shadow-sm transition-all duration-300
        ${active ? 'bg-[#3b5bdb] text-white shadow-indigo-200' : 'bg-[#f0f2fa] text-[#3b5bdb]'}`}>
        {num}
      </div>
      <div>
        <h4 className={`text-sm font-bold ${active ? 'text-[#3b5bdb]' : 'text-[#1e2a3a]'}`}>{title}</h4>
        <p className="text-[12px] text-[#64748b] leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );
}

/* ── Role card -------------------------------------------- */
function RoleCard({ role, description, permissions, gradient }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaf0] shadow-sm p-5 space-y-3
      hover:border-indigo-100 hover:shadow-md transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient}
        flex items-center justify-center shadow-sm`}>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#1e2a3a]">{role}</h4>
        <p className="text-[11px] text-[#64748b] mt-0.5">{description}</p>
      </div>
      <ul className="space-y-1.5 pt-1">
        {permissions.map(p => (
          <li key={p} className="flex items-center gap-2 text-[12px] text-[#64748b]">
            <svg className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Stat box --------------------------------------------- */
function StatBox({ value, label }) {
  return (
    <div className="text-center space-y-1.5 px-6 py-5 bg-white rounded-2xl border border-[#e8eaf0] shadow-sm">
      <p className="text-3xl font-black text-[#3b5bdb]">{value}</p>
      <p className="text-xs text-[#64748b] font-medium leading-tight">{label}</p>
    </div>
  );
}

/* ── Steps data ------------------------------------------- */
const STEPS = [
  { title: 'Select Template',   desc: 'Choose from HR, Finance, Academic or Procurement templates' },
  { title: 'Map Data',          desc: 'Enter a Record ID or upload a CSV to fill all placeholders' },
  { title: 'Generate PDF',      desc: 'SHA-256 hash computed and QR code embedded in the footer' },
  { title: 'Request Signature', desc: 'Send to an Approver with a secure email review link' },
  { title: 'OTP Approval',      desc: 'Approver confirms identity via a 6-digit one-time code' },
  { title: 'Deliver',           desc: 'Email the signed PDF — anyone can verify via QR scan' },
];

const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80&auto=format&fit=crop',
    caption: 'Academic Registry',
  },
  {
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80&auto=format&fit=crop',
    caption: 'University Campus',
  },
  {
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=80&auto=format&fit=crop',
    caption: 'Official Documents',
  },
  {
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80&auto=format&fit=crop',
    caption: 'Student Records',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80&auto=format&fit=crop',
    caption: 'Administration Office',
  },
];

export default function LandingPage() {
  const [activeStep,  setActiveStep]  = useState(0);
  const [slideIndex,  setSlideIndex]  = useState(0);
  const [fadeIn,      setFadeIn]      = useState(true);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 6), 2200);
    return () => clearInterval(t);
  }, []);

  // Slide every 4 seconds with fade transition
  useEffect(() => {
    const t = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setSlideIndex(i => (i + 1) % SLIDES.length);
        setFadeIn(true);
      }, 600);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <PublicLayout>
   
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Slideshow images */}
        {SLIDES.map((slide, i) => (
          <div
            key={slide.url}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === slideIndex ? (fadeIn ? 1 : 0) : 0 }}
          >
            <img
              src={slide.url}
              alt={slide.caption}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

      
        <div className="absolute inset-0 bg-gradient-to-r
          from-[#0f172a]/85 via-[#0f172a]/60 to-[#0f172a]/30"/>

      
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}/>

        {/* Slide dots indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setSlideIndex(i); setFadeIn(true); }}
              className={`rounded-full transition-all duration-300 ${
                i === slideIndex
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Caption badge */}
        <div className="absolute bottom-8 right-6 hidden sm:block">
          <span className="text-[11px] text-white/50 font-medium tracking-wide">
            {SLIDES[slideIndex].caption}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 w-full">
          <div className="max-w-2xl space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2.5
              bg-white/10 backdrop-blur-sm border border-white/20
              rounded-full px-4 py-2">
              <img src="/logo.png" alt="" className="w-5 h-5 object-contain rounded-full"/>
              <span className="text-xs text-white/90 font-semibold">
                Wollo University — Official Document Platform
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
                <span className="text-white block">Smart</span>
                <span className="text-white block">Document</span>
                <span className="block text-indigo-300">Generation.</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-lg pt-2">
                Replace manual PDF creation with a secure, role-based workflow.
                Generate, sign, deliver and verify official documents with
                cryptographic tamper-proof integrity.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {['SHA-256 Integrity','OTP E-Signature','Bulk Generation','Auto Delivery','Public Verify'].map(f => (
                <span key={f}
                  className="inline-flex items-center gap-1.5 text-xs font-medium
                    bg-white/10 backdrop-blur-sm border border-white/20
                    text-white/80 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"/>
                  {f}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/login"
                className="inline-flex items-center justify-center gap-2
                  bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white
                  text-sm font-bold px-8 py-4 rounded-xl
                  shadow-xl shadow-indigo-900/40 transition-all hover:scale-105">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                Sign In to System
              </Link>
              <Link to="/verify"
                className="inline-flex items-center justify-center gap-2
                  bg-white/15 hover:bg-white/25 backdrop-blur-sm
                  border border-white/30 text-white
                  text-sm font-bold px-8 py-4 rounded-xl transition-all">
                <svg className="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Verify a Document
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-20
          bg-gradient-to-t from-[#f7f8fc] to-transparent pointer-events-none"/>
      </section>

      {/* Stats row — floats just below hero */}
      <section className="bg-[#f7f8fc] pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 -mt-6 relative z-10">
            <StatBox value="5+"   label="Document Categories" />
            <StatBox value="5"    label="Role-Based Access Levels" />
            <StatBox value="100%" label="Tamper-Proof via SHA-256" />
            <StatBox value="< 2s" label="Average Generation Time" />
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
      {[
        "Human Resources","Finance Office","Academic Registry",
        "Procurement","Administration","IT Department",
        "Student Services","Research Office",
      ].map(d => (
              <span key={d} className="inline-flex items-center gap-1.5 text-xs font-medium
                bg-[#f7f8fc] border border-[#e8eaf0] text-[#64748b]
                px-3.5 py-2 rounded-full hover:border-indigo-200 hover:text-[#3b5bdb] transition-all">
                <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full"/>
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          FEATURES
      ================================================ */}
      <section id="features" className="bg-[#f7f8fc] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold text-[#3b5bdb] uppercase tracking-widest
              bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-4">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e2a3a] leading-tight">
              Everything you need for
              <span className="text-[#3b5bdb]"> official documents</span>
            </h2>
            <p className="text-[#64748b] mt-3 text-sm leading-relaxed">
              From template creation to cryptographically verified delivery — all in one platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              accent="bg-indigo-50"
              title="Dynamic Template Builder"
              description="Build reusable templates with placeholder syntax for HR, Finance, Academic, and Procurement documents. Supports conditional blocks and loops."
              icon={<svg className="w-5 h-5 text-[#3b5bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
            />
            <FeatureCard
              accent="bg-blue-50"
              title="Single and Bulk Generation"
              description="Generate one document or hundreds at once. Bulk jobs run as background tasks with real-time progress — no waiting, no blocking."
              icon={<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}
            />
            <FeatureCard
              accent="bg-amber-50"
              title="OTP-Based E-Signature"
              description="Approvers confirm identity via a 6-digit one-time code. HMAC-SHA256 cryptographic proof is embedded — fully non-repudiable."
              icon={<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>}
            />
            <FeatureCard
              accent="bg-emerald-50"
              title="Tamper-Proof QR Verification"
              description="Every PDF footer contains a QR code with its SHA-256 hash. Anyone can verify authenticity on the public page — no login required."
              icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
            />
            <FeatureCard
              accent="bg-violet-50"
              title="Secure Email Delivery"
              description="Send signed PDFs directly to recipients via branded email. Generate expiring secure download links and track every access."
              icon={<svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
            />
            <FeatureCard
              accent="bg-rose-50"
              title="Complete Audit Trail"
              description="Every action — generate, preview, sign, deliver, verify — is logged immutably with user, IP, timestamp, and document snapshot."
              icon={<svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>}
            />
          </div>
        </div>
      </section>

      {/* ================================================
          HOW IT WORKS
      ================================================ */}
      <section id="how" className="bg-white py-20 lg:py-28 border-t border-[#e8eaf0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold text-[#3b5bdb] uppercase tracking-widest
              bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-4">
              Document Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e2a3a] leading-tight">
              From template to
              <span className="text-[#3b5bdb]"> verified delivery</span>
            </h2>
            <p className="text-[#64748b] mt-3 text-sm">
              A complete, auditable workflow — every step recorded and traceable.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STEPS.map((s, i) => (
              <StepCard key={s.title} num={i + 1} title={s.title}
                description={s.desc} active={activeStep === i} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/login"
              className="inline-flex items-center gap-2 bg-[#3b5bdb] hover:bg-[#2f4ac4]
                text-white text-sm font-bold px-8 py-3.5 rounded-xl
                shadow-lg shadow-indigo-200 transition-all hover:scale-105">
              Start Using the Platform
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================
          SECURITY
      ================================================ */}
      <section id="security" className="bg-[#f7f8fc] py-20 lg:py-28 border-t border-[#e8eaf0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div className="space-y-6">
              <span className="inline-block text-xs font-bold text-[#3b5bdb] uppercase tracking-widest
                bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                Security and Integrity
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1e2a3a] leading-tight">
                Zero-tamper
                <span className="text-[#3b5bdb]"> tolerance.</span>
              </h2>
              <p className="text-[#64748b] text-base leading-relaxed">
                Every document is fingerprinted with SHA-256 at generation time.
                Any external modification — even a single character — is instantly
                flagged on the public verification page.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'SHA-256',    sub: 'Document fingerprint' },
                  { title: 'HMAC',       sub: 'E-signature proof' },
                  { title: 'OTP 2FA',    sub: 'Approver identity' },
                  { title: 'JWT Tokens', sub: 'Expiring download links' },
                ].map(({ title, sub }) => (
                  <div key={title} className="bg-white border border-[#e8eaf0] rounded-xl p-3.5
                    hover:border-indigo-200 transition-colors">
                    <p className="text-[#1e2a3a] font-bold text-sm">{title}</p>
                    <p className="text-[#64748b] text-[11px] mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
              <Link to="/verify"
                className="inline-flex items-center gap-2 border border-indigo-200
                  hover:border-indigo-400 hover:bg-indigo-50
                  text-[#3b5bdb] text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Try the Verification Page
              </Link>
            </div>

            {/* Right — integrity chain */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-50/60 blur-3xl rounded-3xl"/>
              <div className="relative bg-white rounded-3xl border border-[#e8eaf0] shadow-sm p-6 space-y-3">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-4">
                  SHA-256 Integrity Chain
                </p>
                {[
                  'Document generated and raw PDF created',
                  'SHA-256 hash computed and stored in database',
                  'QR code with hash embedded in PDF footer',
                  'E-signature applied and HMAC recorded',
                  'Public verification confirms authenticity',
                ].map((label, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#f7f8fc]
                    rounded-xl p-3.5 border border-[#e8eaf0]">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200
                      flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <p className="text-[#64748b] text-xs leading-snug">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          ROLES
      ================================================ */}
      <section id="about" className="bg-white py-20 lg:py-28 border-t border-[#e8eaf0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold text-[#3b5bdb] uppercase tracking-widest
              bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-4">
              Access Control
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e2a3a] leading-tight">
              Five roles.
              <span className="text-[#3b5bdb]"> Zero overlap.</span>
            </h2>
            <p className="text-[#64748b] mt-3 text-sm">
              Precisely scoped permissions for every type of user.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <RoleCard role="Super Admin"  description="Full system control"
              gradient="from-indigo-500 to-indigo-700"
              permissions={['System settings','All templates','Full audit logs','User management']} />
            <RoleCard role="System Admin" description="Platform management"
              gradient="from-blue-500 to-blue-700"
              permissions={['Create templates','Manage users','View logs','Generate docs']} />
            <RoleCard role="Generator"    description="HR, Finance, Admin staff"
              gradient="from-sky-500 to-sky-700"
              permissions={['Generate documents','Request signatures','Download own docs','Verify docs']} />
            <RoleCard role="Approver"     description="Directors, Dept. Heads"
              gradient="from-amber-500 to-amber-700"
              permissions={['Review documents','OTP e-signature','Reject with reason','Approval queue']} />
            <RoleCard role="Recipient"    description="Staff, Students, Suppliers"
              gradient="from-emerald-500 to-emerald-700"
              permissions={['View own documents','Download assigned','Verify authenticity']} />
          </div>
        </div>
      </section>

      {/* ================================================
          VERIFY CTA
      ================================================ */}
      <section className="bg-[#f7f8fc] py-14 border-t border-[#e8eaf0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto
            border border-indigo-100">
            <svg className="w-7 h-7 text-[#3b5bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1e2a3a]">
            Received a Wollo University document?
          </h2>
          <p className="text-[#64748b] text-sm max-w-xl mx-auto leading-relaxed">
            Verify its authenticity in seconds — no account needed. Scan the QR code
            on the document or enter the Document ID to confirm it is genuine and untampered.
          </p>
          <Link to="/verify"
            className="inline-flex items-center gap-2 bg-[#3b5bdb] hover:bg-[#2f4ac4]
              text-white text-sm font-bold px-7 py-3.5 rounded-xl
              shadow-lg shadow-indigo-200 transition-all hover:scale-105">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Verify a Document Now
          </Link>
          <p className="text-xs text-[#94a3b8]">Free — no login required — instant result</p>
        </div>
      </section>

      {/* ================================================
          FINAL CTA
      ================================================ */}
      <section className="bg-white py-20 border-t border-[#e8eaf0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7">
          <img src="/logo.png" alt="Wollo University"
            className="h-16 w-auto object-contain mx-auto drop-shadow-sm" />
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e2a3a] leading-tight">
              Ready to go
              <span className="text-[#3b5bdb]"> paperless?</span>
            </h2>
            <p className="text-[#64748b] text-base max-w-lg mx-auto leading-relaxed">
              Join Wollo University's digital transformation. Generate, sign, and deliver
              official documents in minutes — not days.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2
                bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white
                text-base font-bold px-10 py-4 rounded-xl
                shadow-lg shadow-indigo-200 transition-all hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              Sign In to Your Account
            </Link>
            <Link to="/verify"
              className="inline-flex items-center justify-center gap-2
                bg-[#f7f8fc] hover:bg-indigo-50 border border-[#e8eaf0]
                hover:border-indigo-200 text-[#3b5bdb]
                text-base font-bold px-10 py-4 rounded-xl transition-all">
              Verify a Document
            </Link>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Wollo University — Document Generation Engine — ProjID: 01311CIS2026
          </p>
        </div>
      </section>

    </PublicLayout>
  );
}
