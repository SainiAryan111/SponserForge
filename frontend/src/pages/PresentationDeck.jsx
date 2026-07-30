import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Activity, 
  TrendingUp, 
  Building2, 
  UserCheck, 
  ArrowRight,
  Database,
  Code,
  DollarSign,
  Compass,
  Cpu,
  Lock,
  Calendar,
  HelpCircle
} from 'lucide-react';

export default function PresentationDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const totalSlides = 9;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="min-h-[85vh] bg-slate-900 text-slate-100 flex flex-col justify-between p-6 sm:p-8 select-none relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Progress Indicator */}
      <div className="w-full flex items-center justify-between z-10 mb-6">
        <Link to="/" className="flex items-center space-x-2 text-indigo-400 font-extrabold text-lg">
          <Sparkles className="w-5 h-5" />
          <span>SponsorForge</span>
        </Link>
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-400 font-semibold">
          <span>SLIDE {currentSlide + 1} OF {totalSlides}</span>
          <div className="w-20 bg-slate-700 h-1.5 rounded-full overflow-hidden ml-2 hidden sm:block">
            <div 
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Slide Container */}
      <div className="flex-grow flex items-center justify-center z-10 py-4 max-w-5xl mx-auto w-full">
        {currentSlide === 0 && (
          /* Slide 1: Welcome/Title slide */
          <div className="text-center space-y-6 animate-fade-in max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Pitch Deck • Web3 Sponsorship Model</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-400 tracking-tight leading-tight">
              SponsorForge
            </h1>
            <p className="text-lg sm:text-2xl text-slate-300 font-medium">
              AI-Powered Sponsorship & Escrow Marketplace
            </p>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Connecting Brands with Creators via Semantic Vector Matching & Trustless Escrow Payouts
            </p>
            <div className="pt-6">
              <button 
                onClick={nextSlide} 
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-lg shadow-indigo-600/30 inline-flex items-center space-x-2"
              >
                <span>Explore the Presentation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentSlide === 1 && (
          /* Slide 2: The Problem */
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Market Friction</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The Core Industry Challenges</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Brand side */}
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl space-y-4 shadow-lg">
                <div className="flex items-center space-x-3 text-rose-400">
                  <div className="p-2.5 bg-rose-500/10 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">For Brand Entities</h3>
                </div>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Discovery Noise:</strong> Inefficient search filters yield irrelevant profiles, wasting valuable scouting hours.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Poor Niche Alignment:</strong> Keyword matching fails to identify creator content context and actual audience resonance.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Transaction Risk:</strong> Making upfront payments without a secured deliverable guarantee exposes brands to creators ghosting.</span>
                  </li>
                </ul>
              </div>

              {/* Creator side */}
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl space-y-4 shadow-lg">
                <div className="flex items-center space-x-3 text-indigo-400">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">For Creator Nodes</h3>
                </div>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span><strong>Visibility Bottlenecks:</strong> Micro and mid-tier creators struggle to surface in saturated search pools.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span><strong>Payout Inefficiencies:</strong> Standard campaigns take 30 to 90 days to settle after completion.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span><strong>Deliverable Exploitation:</strong> Creators submit content briefs and draft copies with zero deposit safety, leading to unpaid work.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentSlide === 2 && (
          /* Slide 3: The Solution */
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">SponsorForge Paradigm</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">A Dual-Pillar AI Escrow Ecosystem</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-6 bg-slate-800/30 border border-slate-700/40 rounded-2xl space-y-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">1. AI Semantic Matching</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Leverages sentence embedding similarity algorithms (`all-MiniLM-L6-v2`) to link creator biography keywords and brand briefs directly.
                </p>
              </div>

              <div className="p-6 bg-slate-800/30 border border-slate-700/40 rounded-2xl space-y-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">2. Points-Escrow System</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Funds are automatically verified and locked in escrow when the brand hires a creator. Released instantly upon deliverable review.
                </p>
              </div>

              <div className="p-6 bg-slate-800/30 border border-slate-700/40 rounded-2xl space-y-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">3. Role-Adaptive Portals</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Dedicated Brand & Creator interfaces display niche-relevant analytics, active pipeline status tabs, and profile configurations.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentSlide === 3 && (
          /* Slide 4: Dual-Portal Core Features */
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Interface Breakdown</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Dual-Portal Core Functional Grid</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-850 border border-slate-700/60 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-indigo-950/40 px-5 py-3 border-b border-slate-700/60 font-bold text-white flex items-center space-x-2 text-sm uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Brand Portal Features</span>
                </div>
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody>
                    <tr className="border-b border-slate-700/40">
                      <td className="px-5 py-3.5 font-semibold text-slate-300 w-1/3">Campaign Builder</td>
                      <td className="px-5 py-3.5 text-slate-400">Launch briefs with specific platforms, niche targets, and points rewards.</td>
                    </tr>
                    <tr className="border-b border-slate-700/40">
                      <td className="px-5 py-3.5 font-semibold text-slate-300">Pipeline Tab Bar</td>
                      <td className="px-5 py-3.5 text-slate-400">Track applicants via Pending, In-Progress, Submitted, and Completed states.</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-semibold text-slate-300">Fund Manager</td>
                      <td className="px-5 py-3.5 text-slate-400">Add points in profile settings to instantly fund multiple campaigns.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-850 border border-slate-700/60 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-emerald-950/40 px-5 py-3 border-b border-slate-700/60 font-bold text-white flex items-center space-x-2 text-sm uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Creator Portal Features</span>
                </div>
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody>
                    <tr className="border-b border-slate-700/40">
                      <td className="px-5 py-3.5 font-semibold text-slate-300 w-1/3">AI Matching Feed</td>
                      <td className="px-5 py-3.5 text-slate-400">See similarity matching scores (% Match) tailored to bio and platform statistics.</td>
                    </tr>
                    <tr className="border-b border-slate-700/40">
                      <td className="px-5 py-3.5 font-semibold text-slate-300">Quick Pitch form</td>
                      <td className="px-5 py-3.5 text-slate-400">Apply to matching briefs instantly with customized pitch statements.</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-semibold text-slate-300">Work Submitter</td>
                      <td className="px-5 py-3.5 text-slate-400">Submit deliverables directly inside card actions via proof links.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentSlide === 4 && (
          /* Slide 5: Technical Architecture */
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Stack Architecture</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Full-Stack Tech Topology</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col justify-between shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Code className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Frontend Client</span>
                  </div>
                  <ul className="space-y-2 text-slate-300 text-xs sm:text-sm">
                    <li>• React Router v6 & Context API</li>
                    <li>• Tailwind CSS for typography</li>
                    <li>• Axios with Auto-Refresh Interceptor</li>
                    <li>• Responsive Glassmorphic Cards</li>
                  </ul>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase pt-4">User Interface Layer</div>
              </div>

              <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col justify-between shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Cpu className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Backend API Gateway</span>
                  </div>
                  <ul className="space-y-2 text-slate-300 text-xs sm:text-sm">
                    <li>• Django REST Framework ViewSets</li>
                    <li>• SimpleJWT token authentication</li>
                    <li>• SentenceTransformer Embedding Engine</li>
                    <li>• Cosine similarity search logic</li>
                  </ul>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase pt-4">Logic & Semantic Matching</div>
              </div>

              <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col justify-between shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-300">
                    <Database className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Database Node</span>
                  </div>
                  <ul className="space-y-2 text-slate-300 text-xs sm:text-sm">
                    <li>• PostgreSQL Relational Engine</li>
                    <li>• pgvector vector extension</li>
                    <li>• Cosine distance query indexes</li>
                    <li>• HNSW Index structure</li>
                  </ul>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase pt-4">Relational & Vector Storage</div>
              </div>
            </div>
          </div>
        )}

        {currentSlide === 5 && (
          /* Slide 6: End-to-End Escrow Lifecycle */
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Process Flow</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">End-to-End Escrow & Payment Lifecycle</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
              <div className="p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl space-y-2 relative">
                <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 w-6 h-6 rounded-full flex items-center justify-center">1</div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Brief Creation</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">Brand designs campaign. Backend auto-indexes vector embedding.</p>
              </div>

              <div className="p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl space-y-2">
                <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 w-6 h-6 rounded-full flex items-center justify-center">2</div>
                <h4 className="font-bold text-white text-xs sm:text-sm">AI Recommendation</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">Creators view ranked campaign recommendations based on niche scores.</p>
              </div>

              <div className="p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl space-y-2">
                <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 w-6 h-6 rounded-full flex items-center justify-center">3</div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Hiring & Escrow</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">Brand accepts pitch. Creator is hired and campaign points are locked.</p>
              </div>

              <div className="p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl space-y-2">
                <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 w-6 h-6 rounded-full flex items-center justify-center">4</div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Work Submission</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">Creator uploads deliverable URL. State changes to "Submitted".</p>
              </div>

              <div className="p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl space-y-2 border-emerald-500/30 bg-emerald-500/[0.02]">
                <div className="text-xs font-black text-emerald-400 bg-emerald-500/10 w-6 h-6 rounded-full flex items-center justify-center">5</div>
                <h4 className="font-bold text-emerald-300 text-xs sm:text-sm">Instant Release</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">Brand approves deliverable. Escrow points are transferred to Creator balance.</p>
              </div>
            </div>
          </div>
        )}

        {currentSlide === 6 && (
          /* Slide 7: Security & Smart Access */
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Platform Security</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Trustless Security & Integrity Layers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Dual JWT Middleware</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Automatic, silent JWT refresh interceptor renews access tokens on 401 response codes, preserving logged-in sessions.
                </p>
              </div>

              <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Role-Aware Route Guards</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Checks token role payloads on load. Automatically redirects creator credentials away from brand portals and vice-versa.
                </p>
              </div>

              <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Real-Time Vector Sync</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Triggers immediate database vector re-indexing during creator profile updates, ensuring matches reflect the latest bio.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentSlide === 7 && (
          /* Slide 8: Roadmap & Future Expansion */
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Growth Plan</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">SponsorForge Expansion Timeline</h2>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full ring-4 ring-indigo-500/20"></div>
                  <div className="w-0.5 h-10 bg-slate-700"></div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Phase 1: Foundation (Completed)</h4>
                  <p className="text-slate-400 text-xs">Vector similarity matching feed, role dashboards, and transactional escrow engine.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full ring-4 ring-indigo-500/20"></div>
                  <div className="w-0.5 h-10 bg-slate-700"></div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Phase 2: Real-Time Alerts (In Progress)</h4>
                  <p className="text-slate-400 text-xs">Set up Django Channels and WebSockets to push live notifications for applications and payouts.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 bg-slate-700 rounded-full"></div>
                  <div className="w-0.5 h-10 bg-slate-700"></div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-300 text-xs sm:text-sm">Phase 3: Fiat checkout Integration</h4>
                  <p className="text-slate-400 text-xs">Stripe/PayPal gateways allowing brand checkout and direct bank-transfer cashout for creators.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 bg-slate-700 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-300 text-xs sm:text-sm">Phase 4: ROI Analytics Dashboard</h4>
                  <p className="text-slate-400 text-xs">Integrate YouTube and Instagram APIs to track active campaign click-through rates and ROI charts.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSlide === 8 && (
          /* Slide 9: Conclusion */
          <div className="text-center space-y-6 animate-fade-in max-w-2xl">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full w-fit mx-auto">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Join the Future of Sponsorships</h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              SponsorForge removes the trust bottleneck and discovery matching gaps in influencer marketing. Safe payouts, fast matching, zero friction.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                Launch Brand Portal
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold rounded-xl transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Slide Navigation Buttons */}
      <div className="w-full flex items-center justify-between z-10 border-t border-slate-800/80 pt-6 mt-4">
        <button 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
          className="px-4 py-2 border border-slate-750 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition inline-flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Index Dots */}
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                currentSlide === idx 
                  ? 'bg-indigo-500 w-5' 
                  : 'bg-slate-700 hover:bg-slate-500'
              }`}
            ></button>
          ))}
        </div>

        <button 
          onClick={nextSlide} 
          disabled={currentSlide === totalSlides - 1}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition inline-flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
