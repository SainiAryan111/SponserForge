import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Building2, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Star, 
  CheckCircle2, 
  CheckCircle, 
  Search, 
  Flame, 
  DollarSign,
  ArrowUpRight
} from 'lucide-react';

export default function WelcomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const coreFeatures = [
    {
      title: "Smart AI Creator Matching",
      badge: "AI MATCHING",
      desc: "Our smart AI system analyzes campaign requirements and creator profiles to instantly calculate a match score based on niche, platform, and subscriber size.",
      accent: "from-blue-600 via-indigo-600 to-purple-600",
      borderGlow: "shadow-blue-500/20 hover:border-blue-400",
      previewLabel: "MATCH EXAMPLE",
      previewContent: {
        creator: "@TechReviewPro",
        niche: "Tech & AI",
        score: "98% Match",
        stats: "120K Subs • 5.2% Engagement"
      }
    },
    {
      title: "Clear Submission Deadlines",
      badge: "LIVE TIMERS",
      desc: "Set clear 24h, 48h, or 7-day deadlines when hiring creators. Live ticking timers keep work delivered on schedule.",
      accent: "from-amber-500 via-rose-500 to-red-600",
      borderGlow: "shadow-amber-500/20 hover:border-amber-400",
      previewLabel: "SUBMISSION TIMER",
      previewContent: {
        timer: "47h : 59m : 24s",
        status: "Timer Active",
        reward: "1,500 Points Reward"
      }
    },
    {
      title: "Protected Escrow Points",
      badge: "SECURE PAYMENTS",
      desc: "Campaign points are held safely in escrow. Payments are automatically transferred to the creator once the brand reviews and approves the deliverable.",
      accent: "from-emerald-500 via-teal-600 to-cyan-600",
      borderGlow: "shadow-emerald-500/20 hover:border-emerald-400",
      previewLabel: "POINTS ESCROW LOCK",
      previewContent: {
        balance: "2,500 Points Locked",
        guarantee: "100% Guaranteed Payment"
      }
    },
    {
      title: "Browse Directory & Direct Hiring",
      badge: "CREATOR DIRECTORY",
      desc: "Browse creators by niche, subscriber count, and star ratings. Send direct sponsorship offers with custom instructions.",
      accent: "from-purple-600 via-pink-600 to-rose-600",
      borderGlow: "shadow-purple-500/20 hover:border-purple-400",
      previewLabel: "DIRECT OFFER PORTAL",
      previewContent: {
        directory: "Verified Creators",
        action: "Direct Offer Sent"
      }
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Create & Match",
      desc: "Brands launch campaigns with point rewards. Smart AI matches top creators based on niche and audience.",
      icon: Search,
      iconGradient: "from-blue-600 to-indigo-600",
      cardGradient: "from-blue-950/40 via-slate-900 to-slate-950",
      borderGlow: "hover:border-blue-500/60 shadow-blue-950/40",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30"
    },
    {
      step: "02",
      title: "Hire & Set Deadline",
      desc: "Brand accepts creator proposal or sends direct offer with work guidelines and a clear submission deadline.",
      icon: Clock,
      iconGradient: "from-purple-600 to-pink-600",
      cardGradient: "from-purple-950/40 via-slate-900 to-slate-950",
      borderGlow: "hover:border-purple-500/60 shadow-purple-950/40",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30"
    },
    {
      step: "03",
      title: "Submit Work",
      desc: "Creator creates content and submits the deliverable link before the deadline timer expires.",
      icon: Zap,
      iconGradient: "from-amber-500 to-rose-600",
      cardGradient: "from-amber-950/40 via-slate-900 to-slate-950",
      borderGlow: "hover:border-amber-500/60 shadow-amber-950/40",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30"
    },
    {
      step: "04",
      title: "Approve & Pay",
      desc: "Brand reviews deliverable, submits a rating, and points are instantly sent to creator's balance.",
      icon: ShieldCheck,
      iconGradient: "from-emerald-500 to-teal-600",
      cardGradient: "from-emerald-950/40 via-slate-900 to-slate-950",
      borderGlow: "hover:border-emerald-500/60 shadow-emerald-950/40",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    }
  ];

  const faqs = [
    {
      q: "How does Smart AI Creator Matching work?",
      a: "When a brand creates a campaign (specifying title, niche, and requirements), our AI evaluates creator profiles, niches, subscriber count, and ratings to display a percentage match score.",
      tag: "AI MATCHING"
    },
    {
      q: "How does Escrow Protection work for payments?",
      a: "When a brand hires a creator, campaign points are locked safely in escrow. Once the creator submits their work link and the brand approves it, points are immediately released.",
      tag: "SAFE PAYMENTS"
    },
    {
      q: "What happens if a creator misses the submission deadline?",
      a: "Each deal includes a clear deadline timer (e.g. 24h, 48h, 7 days). If the deadline passes without submission, the deal automatically expires and points return to the brand.",
      tag: "DEADLINES"
    },
    {
      q: "Can brands send direct offers to creators?",
      a: "Yes! Brands can browse the Creator Directory, filter creators by niche or ratings, and send direct campaign offers with custom instructions.",
      tag: "DIRECT OFFERS"
    }
  ];

  // Auto-rotate Carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % coreFeatures.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [coreFeatures.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION WITH SEAMLESS BLENDED GRADIENT */}
      <section className="relative pt-20 pb-28 px-4 border-b border-slate-800/80 overflow-hidden bg-gradient-to-b from-blue-950 via-purple-950 to-zinc-950">
        
        {/* BLENDED RADIAL GLOW ORBS */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-xl shadow-purple-950/50">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>AI Sponsorship Marketplace for Brands & Content Creators</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-5xl mx-auto">
            Sponsorship deals built with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-red-400 bg-clip-text text-transparent">
              Smart AI Matching
            </span>{' '}
            & Secure Escrow.
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            Connect brands with top content creators. Review proposals, set clear deadlines, and manage secure points payments effortlessly.
          </p>

          {/* DUAL ACTION CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 max-w-xl mx-auto">
            
            {/* BRAND CTA */}
            <Link
              to="/signup?role=brand"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-600/30 transition flex items-center justify-center space-x-2 cursor-pointer hover:scale-105"
            >
              <Building2 className="w-5 h-5" />
              <span>Create Brand Campaign</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* CREATOR CTA */}
            <Link
              to="/signup?role=creator"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/40 transition flex items-center justify-center space-x-2 cursor-pointer hover:scale-105"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Join as Content Creator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

          {/* Platform Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-slate-300 text-xs sm:text-sm font-bold border-t border-slate-800/80 max-w-4xl mx-auto">
            <span className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Escrow Points Protection</span>
            </span>
            <span className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Smart AI Matching</span>
            </span>
            <span className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Live Submission Timers</span>
            </span>
            <span className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Verified 5-Star Reviews</span>
            </span>
          </div>

        </div>
      </section>

      {/* 2. CORE FEATURES CAROUSEL */}
      <section className="bg-slate-950 py-24 px-4 border-b border-slate-900 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/30">
              💎 SPONSERFORGE FEATURES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Main Platform Features</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-medium">
              Everything you need for seamless brand and creator partnerships.
            </p>
          </div>

          {/* CAROUSEL CARD DISPLAY */}
          <div className="relative max-w-5xl mx-auto">
            
            {/* CAROUSEL CONTENT CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden transition-all duration-500">
              
              {/* Dynamic Aura Glow */}
              <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${coreFeatures[activeSlide].accent} opacity-15 rounded-full blur-3xl pointer-events-none`}></div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                
                {/* Left Side: Info */}
                <div className="space-y-4 max-w-xl">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/80 px-3.5 py-1.5 rounded-full border border-purple-500/40">
                    {coreFeatures[activeSlide].badge}
                  </span>

                  <h3 className="text-2xl sm:text-4xl font-black text-white">
                    {coreFeatures[activeSlide].title}
                  </h3>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                    {coreFeatures[activeSlide].desc}
                  </p>
                </div>

                {/* Right Side: Interactive Simulation Box */}
                <div className="w-full lg:w-96 bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-2">
                    {coreFeatures[activeSlide].previewLabel}
                  </span>

                  <div className="space-y-2 text-xs font-bold text-slate-200">
                    <p>Creator: <strong className="text-white">{coreFeatures[activeSlide].previewContent.creator || coreFeatures[activeSlide].previewContent.timer || coreFeatures[activeSlide].previewContent.balance || coreFeatures[activeSlide].previewContent.directory}</strong></p>
                    <p>Status: <strong className="text-emerald-400">{coreFeatures[activeSlide].previewContent.score || coreFeatures[activeSlide].previewContent.status || coreFeatures[activeSlide].previewContent.guarantee || coreFeatures[activeSlide].previewContent.action}</strong></p>
                    {coreFeatures[activeSlide].previewContent.stats && (
                      <p className="text-slate-400 font-normal">{coreFeatures[activeSlide].previewContent.stats}</p>
                    )}
                  </div>
                </div>

              </div>

              {/* CAROUSEL PROGRESS INDICATORS */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800 relative z-10">
                <div className="flex items-center space-x-2">
                  {coreFeatures.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeSlide === idx ? 'w-8 bg-purple-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveSlide((prev) => (prev === 0 ? coreFeatures.length - 1 : prev - 1))}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveSlide((prev) => (prev + 1) % coreFeatures.length)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. WORKFLOW: HOW SPONSERFORGE WORKS */}
      <section className="bg-slate-900/90 py-24 px-4 border-b border-slate-800 relative">
        <div className="max-w-6xl mx-auto space-y-14">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30">
              ⚡ EASY 4-STEP WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">How SponserForge Works</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-medium">
              From discovering top creators to submitting work and getting paid safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((item, idx) => (
              <div 
                key={idx}
                className={`bg-gradient-to-b ${item.cardGradient} border border-slate-800/80 rounded-3xl p-7 space-y-5 transition duration-500 relative group hover:-translate-y-2 shadow-2xl ${item.borderGlow}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${item.iconGradient} text-white flex items-center justify-center font-bold shadow-lg`}>
                    {React.createElement(item.icon, { className: 'w-6 h-6' })}
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${item.badgeColor}`}>
                    STEP {item.step}
                  </span>
                </div>

                <h4 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition">
                  {item.title}
                </h4>

                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>

                <div className="pt-2 flex items-center space-x-1 text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">
                  <span>Learn more</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <section className="bg-slate-950 py-24 px-4 border-b border-slate-900 relative">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
              💬 GOT QUESTIONS?
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-medium">
              Answers to everything you need to know as a Brand or Creator.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                    isOpen 
                      ? 'bg-slate-900 border-purple-500/50 shadow-2xl shadow-purple-950/40' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between font-extrabold text-white text-base sm:text-lg hover:text-purple-300 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs uppercase font-black tracking-wider border ${
                        isOpen ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {faq.tag}
                      </span>
                      <span>{faq.q}</span>
                    </div>

                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${
                      isOpen ? 'rotate-180 text-purple-400' : ''
                    }`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800/80 bg-slate-950/60 space-y-3 font-medium">
                      <p>{faq.a}</p>
                      <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-400 pt-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verified Platform Guarantee</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}