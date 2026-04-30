'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Mark({
  size = 48,
  o1 = 1, o2 = 0.5, o3 = 0.2,
  id = 'mark',
}: { size?: number; o1?: number; o2?: number; o3?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <line x1="5"  y1="42" x2="19" y2="6"  stroke={`url(#${id})`} strokeWidth="5.5" strokeLinecap="round" opacity={o1} />
      <line x1="17" y1="42" x2="31" y2="6"  stroke={`url(#${id})`} strokeWidth="5.5" strokeLinecap="round" opacity={o2} />
      <line x1="29" y1="42" x2="43" y2="6"  stroke={`url(#${id})`} strokeWidth="5.5" strokeLinecap="round" opacity={o3} />
    </svg>
  )
}

// Scroll-triggered fade-up wrapper
function FadeUp({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: React.ElementType
}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(28px)',
        transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}

// Animated counter
function useCounter(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    setCount(0)
    const startTime = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])
  return count
}

function StatItem({ raw, label }: { raw: string; label: string }) {
  const num = parseInt(raw)
  const suffix = raw.replace(/[0-9]/g, '')
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const count = useCounter(num, 1800, started)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black gradient-text mb-1.5 tabular-nums">
        {started ? count : 0}{suffix}
      </div>
      <div className="text-white/40 text-xs uppercase tracking-[0.18em] font-medium">{label}</div>
    </div>
  )
}

// ─── Grain overlay ────────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[200] opacity-[0.032]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '250px 250px',
        mixBlendMode: 'overlay',
      }}
    />
  )
}

// ─── Cursor glow ──────────────────────────────────────────────────────────────

function CursorGlow() {
  const [pos, setPos] = useState({ x: -600, y: -600 })
  const [active, setActive] = useState(false)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setActive(true)
    }
    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [])

  if (!active) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[190] rounded-full"
      style={{
        width: 480,
        height: 480,
        left: pos.x - 240,
        top: pos.y - 240,
        background: 'radial-gradient(circle, rgba(217,119,6,0.10) 0%, rgba(234,88,12,0.04) 40%, transparent 70%)',
        transition: 'left 0.12s ease, top 0.12s ease',
      }}
    />
  )
}

// ─── Marquee strip ────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  'Web Design', 'Web Development', 'Brand Identity',
  'SEO & Performance', 'Site Maintenance', 'Strategy & Consulting',
]

function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="gradient-bg py-4 overflow-hidden select-none" aria-hidden="true">
      <div className="flex animate-marquee whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {MARQUEE_ITEMS.map((item) => (
              <span key={item} className="flex items-center gap-5 mx-7 text-white font-semibold text-sm tracking-wide">
                <Mark size={14} id={`mq-${copy}-${item.replace(/\s/g,'')}`} o1={1} o2={1} o3={1} />
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = ['Work', 'Services', 'Process', 'About']

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#1A1040]/95 backdrop-blur-md py-3 shadow-2xl shadow-black/20' : 'py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <Mark size={30} id="nav-mark" />
          <span className="font-black text-white text-lg tracking-tight">
            beyond<span className="font-light text-white/40"> concepts</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}
               className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200">
              {item}
            </a>
          ))}
          <a href="#contact"
             className="px-5 py-2.5 rounded-full text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-opacity">
            Start a Project
          </a>
        </div>

        <button className="md:hidden text-white/70 hover:text-white p-2"
                onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-current transition-all origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#1A1040]/98 backdrop-blur-md border-t border-white/10 animate-slide-down">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
            {links.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                 onClick={() => setMenuOpen(false)}
                 className="text-white/70 hover:text-white text-lg font-medium transition-colors py-2">
                {item}
              </a>
            ))}
            <a href="#contact" onClick={() => setMenuOpen(false)}
               className="mt-2 px-6 py-3 rounded-full text-center font-semibold text-white gradient-bg">
              Start a Project
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen bg-[#1A1040] flex flex-col justify-center overflow-hidden">
      <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 pointer-events-none select-none animate-pulse-slow">
        <Mark size={520} id="hero-bg" o1={1} o2={1} o3={1} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(217,119,6,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-32">
        <div className="flex items-center gap-2.5 mb-10 animate-fade-in">
          <div className="w-1.5 h-1.5 rounded-full gradient-bg" />
          <span className="text-xs font-semibold tracking-[0.22em] text-white/40 uppercase">
            Web Design & Development Studio · Australia
          </span>
        </div>

        <h1 className="text-[clamp(3rem,9vw,7rem)] font-black text-white leading-[0.88] tracking-tight mb-8 max-w-5xl animate-fade-in-up">
          We Build<br />
          Websites That<br />
          Go <span className="gradient-text">Beyond.</span>
        </h1>

        <p className="text-white/55 text-xl max-w-lg leading-relaxed mb-12 animate-fade-in-up delay-200">
          Beyond Concepts is an Australian web studio crafting high-performance digital
          experiences — from brand identity to launch and beyond.
        </p>

        <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
          <a href="#work"
             className="px-8 py-4 rounded-full font-semibold text-white gradient-bg hover:opacity-90 transition-opacity text-sm">
            View Our Work
          </a>
          <a href="#contact"
             className="px-8 py-4 rounded-full font-semibold text-white border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all text-sm">
            Start a Project →
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/25 animate-fade-in delay-600">
        <span className="text-[10px] tracking-[0.3em] uppercase font-medium">Scroll</span>
        <div className="w-px h-14 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { raw: '10+', label: 'Projects Delivered' },
  { raw: '5',   label: 'Industries Served'  },
  { raw: '3+',  label: 'Years Building'     },
  { raw: '100%', label: 'Australian Team'   },
]

function Stats() {
  return (
    <section className="bg-[#130C35] border-y border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {STATS.map((s) => <StatItem key={s.label} {...s} />)}
      </div>
    </section>
  )
}

// ─── Work ─────────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    name: 'OOHC Services',
    url: 'oohcservices.com.au',
    description: 'Driver licence coordination platform for Australian foster care agencies — built to support young adults transitioning out of care.',
    tag: 'Web Design & Dev',
    from: '#0d2137', to: '#1a3a52', accent: '#4ECDC4', id: 'oohc',
  },
  {
    name: 'Capacity Builders',
    url: 'capacitybuilders.com.au',
    description: 'Complete NDIS disability support services rebuild — cutting 35 plugins to 7 while boosting performance and SEO.',
    tag: 'Web Redesign',
    from: '#0a2518', to: '#16452e', accent: '#6FCF97', id: 'cb',
  },
  {
    name: 'Chaikaari',
    url: 'chaikaari.com.au',
    description: 'Warm, story-driven website for an authentic Indian tea house — where culture meets digital presence.',
    tag: 'Brand & Web',
    from: '#2d0e00', to: '#7c2d12', accent: '#F59E0B', id: 'chai',
  },
]

function Work() {
  return (
    <section id="work" className="bg-[#FAF9F6] py-28">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="mb-16">
          <span className="text-xs font-bold tracking-[0.22em] text-amber-600 uppercase">Our Work</span>
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-[#1A1040] leading-tight mt-4">
            Websites Built<br />to Perform.
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {PROJECTS.map((p, i) => (
            <FadeUp key={p.name} delay={i * 100}>
              <a href={`https://www.${p.url}`} target="_blank" rel="noopener noreferrer"
                 className="group block rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-2xl h-full">
                <div className="h-52 relative flex items-end p-6"
                     style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}>
                  <div className="absolute top-5 right-5 opacity-[0.12]">
                    <Mark size={90} id={`work-${p.id}`} o1={1} o2={1} o3={1} />
                  </div>
                  <div className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.accent }} />
                    <span className="text-white/80 text-xs font-medium">{p.url}</span>
                  </div>
                </div>
                <div className="bg-white px-6 pt-5 pb-6 border border-t-0 border-gray-100 rounded-b-2xl h-full">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#1A1040] group-hover:text-amber-600 transition-colors">{p.name}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full whitespace-nowrap ml-3 mt-0.5">
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-amber-600 text-xs font-semibold group-hover:gap-3 transition-all">
                    <span>Visit site</span><span>↗</span>
                  </div>
                </div>
              </a>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>,
    title: 'Web Design',
    desc: 'Beautiful, user-focused interfaces crafted to guide visitors toward action. Every pixel earns its place.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    title: 'Web Development',
    desc: 'Fast, scalable builds on modern frameworks — Next.js, WordPress, and more. Clean code, tested across devices.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    title: 'Brand Identity',
    desc: 'Logo, colour, typography — the visual system that makes you instantly recognisable and unforgettable.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'SEO & Performance',
    desc: 'Get found by the right people. We build for speed and optimise for search from day one.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Site Maintenance',
    desc: 'Ongoing updates, security patches, and backups. Keep your site fast, secure, and up to date.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    title: 'Strategy & Consulting',
    desc: "Not sure where to start? We'll help you map the right digital move for your stage and budget.",
  },
]

function Services() {
  return (
    <section id="services" className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="mb-16">
          <span className="text-xs font-bold tracking-[0.22em] text-amber-600 uppercase">What We Do</span>
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-[#1A1040] leading-tight mt-4">
            Full-Service<br />Web Studio.
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 border border-gray-100 rounded-2xl overflow-hidden">
          {SERVICES.map((s, i) => (
            <FadeUp key={s.title} delay={i * 80}
                    className={`p-8 hover:bg-[#FAF9F6] transition-colors group ${
                      i % 3 !== 2 ? 'md:border-r border-gray-100' : ''
                    } ${i >= 3 ? 'border-t border-gray-100' : ''}`}>
              <div className="text-amber-500 mb-5 group-hover:text-amber-600 group-hover:scale-110 transition-all inline-block">
                {s.icon}
              </div>
              <h3 className="text-base font-bold text-[#1A1040] mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Process ──────────────────────────────────────────────────────────────────

const STEPS = [
  { num: '01', title: 'Discover',     desc: 'We dive into your business, goals, and audience — building the right foundation before a single pixel is placed.' },
  { num: '02', title: 'Design',       desc: 'Wireframes and high-fidelity visuals, refined until every screen feels inevitable.' },
  { num: '03', title: 'Build',        desc: 'Clean, performant code. Tested across browsers and devices. Deployed with care.' },
  { num: '04', title: 'Launch & Grow', desc: 'Go live with confidence. Ongoing support and optimisation keeps you ahead of the curve.' },
]

function Process() {
  return (
    <section id="process" className="bg-[#1A1040] py-28">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="mb-16">
          <span className="text-xs font-bold tracking-[0.22em] text-amber-500 uppercase">How We Work</span>
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-tight mt-4">
            From Idea<br />to Launch.
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {STEPS.map((s, i) => (
            <FadeUp key={s.num} delay={i * 100}>
              <div className="text-[5rem] font-black leading-none text-white/[0.05] mb-5 select-none">{s.num}</div>
              <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "Beyond Concepts delivered something we couldn't have imagined ourselves. The process was seamless, the communication was excellent, and the result speaks for itself.",
    author: 'Sarah M.',
    role: 'Director, OOHC Services',
  },
  {
    quote: "Our old site was holding us back. The new one is faster, cleaner, and has directly generated more enquiries. Best digital investment we've made.",
    author: 'James T.',
    role: 'Founder, Capacity Builders',
  },
  {
    quote: "They understood our brand instantly — the warmth, the culture, the story. Our website now feels genuinely like us. The compliments haven't stopped since launch.",
    author: 'Priya K.',
    role: 'Owner, Chaikaari',
  },
]

function Testimonials() {
  return (
    <section className="bg-[#FAF9F6] py-28">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="mb-16 text-center">
          <span className="text-xs font-bold tracking-[0.22em] text-amber-600 uppercase">Kind Words</span>
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-[#1A1040] leading-tight mt-4">
            What clients say.
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.author} delay={i * 100}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-400">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Large opening quote */}
                <div className="text-5xl text-amber-100 font-serif leading-none mb-4 select-none">"</div>

                <p className="text-gray-600 text-sm leading-relaxed flex-1 -mt-4">{t.quote}</p>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1A1040]">{t.author}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <FadeUp>
              <span className="text-xs font-bold tracking-[0.22em] text-amber-600 uppercase">About Us</span>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-[#1A1040] leading-tight mt-4 mb-8">
                A team that<br />goes further.
              </h2>
            </FadeUp>
            <FadeUp delay={100}>
              <p className="text-gray-600 leading-relaxed mb-5 text-[15px]">
                Beyond Concepts is an Australian web design and development studio. We partner with
                businesses of all sizes to create digital experiences that aren't just beautiful —
                they're fast, accessible, and built to grow with you.
              </p>
            </FadeUp>
            <FadeUp delay={200}>
              <p className="text-gray-600 leading-relaxed mb-10 text-[15px]">
                From NDIS service providers to hospitality brands and social enterprises, we bring
                the same level of care and craft to every project. We think beyond the brief, so you don't have to.
              </p>
              <a href="#contact"
                 className="inline-flex items-center gap-2 font-semibold text-amber-600 hover:text-orange-600 transition-colors text-sm">
                Let's work together →
              </a>
            </FadeUp>
          </div>

          <FadeUp delay={150} className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#1A1040] to-[#2d1b69] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]"
                   style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
              <Mark size={180} id="about-mark" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl px-6 py-5 shadow-2xl border border-gray-100">
              <div className="text-[#1A1040] font-black text-lg">beyondconcepts.com.au</div>
              <div className="text-gray-400 text-xs mt-0.5 tracking-wide">Australian Web Studio</div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function Contact() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name    = fd.get('name')    as string
    const email   = fd.get('email')   as string
    const company = fd.get('company') as string
    const message = fd.get('message') as string
    const body = `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\nMessage:\n${message}`
    window.location.href = `mailto:hello@beyondconcepts.com.au?subject=Project Enquiry — ${name}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section id="contact" className="bg-[#1A1040] py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(217,119,6,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20">
          <FadeUp>
            <span className="text-xs font-bold tracking-[0.22em] text-amber-500 uppercase">Get in Touch</span>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-tight mt-4 mb-8">
              Let's build<br />something{' '}
              <span className="gradient-text">great.</span>
            </h2>
            <p className="text-white/50 leading-relaxed mb-10 text-[15px] max-w-sm">
              Tell us about your project. We respond within 24 hours.
            </p>
            <div className="space-y-4">
              <a href="mailto:hello@beyondconcepts.com.au"
                 className="flex items-center gap-4 text-white/60 hover:text-white transition-colors group">
                <span className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <span className="text-sm">hello@beyondconcepts.com.au</span>
              </a>
              <div className="flex items-center gap-4 text-white/40">
                <span className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </span>
                <span className="text-sm">Based in Australia</span>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={150}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'name',  label: 'Name *',  type: 'text',  placeholder: 'Your name',       required: true },
                  { name: 'email', label: 'Email *', type: 'email', placeholder: 'you@company.com', required: true },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2 block">{f.label}</label>
                    <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder}
                           className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-500/60 focus:bg-white/10 transition-all" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2 block">Company</label>
                <input name="company" placeholder="Your company (optional)"
                       className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-500/60 focus:bg-white/10 transition-all" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2 block">Message *</label>
                <textarea name="message" required rows={5}
                          placeholder="Tell us about your project — what you need, your timeline, your budget..."
                          className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-500/60 focus:bg-white/10 transition-all resize-none" />
              </div>
              {sent ? (
                <div className="flex items-center gap-3 text-amber-400 font-medium py-2">
                  <span className="text-lg">✓</span>
                  <span>Opening your mail client…</span>
                </div>
              ) : (
                <button type="submit"
                        className="w-full py-4 rounded-xl font-semibold text-white gradient-bg hover:opacity-90 transition-opacity text-sm tracking-wide">
                  Send Message →
                </button>
              )}
            </form>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── Back to top ──────────────────────────────────────────────────────────────

function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-amber-900/30 transition-all duration-300 hover:scale-110 hover:opacity-90 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#0F0A2A] border-t border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="#" className="flex items-center gap-3">
            <Mark size={26} id="footer-mark" />
            <span className="font-black text-white text-base tracking-tight">
              beyond<span className="font-light text-white/30"> concepts</span>
            </span>
          </a>
          <div className="flex items-center gap-7">
            {['Work', 'Services', 'Process', 'About', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                 className="text-white/30 hover:text-white/70 text-xs font-medium transition-colors tracking-wide">
                {item}
              </a>
            ))}
          </div>
          <div className="text-white/25 text-xs">© {new Date().getFullYear()} Beyond Concepts</div>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <GrainOverlay />
      <CursorGlow />
      <Nav />
      <Hero />
      <Stats />
      <MarqueeStrip />
      <Work />
      <Services />
      <Process />
      <Testimonials />
      <About />
      <Contact />
      <Footer />
      <BackToTop />
    </>
  )
}
