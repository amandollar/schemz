import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Zap, Users, Search, 
  FileText, CheckCircle2, Menu, X, ChevronRight 
} from 'lucide-react';
import { 
  SectionWrapper, FeatureCard, StepCard, 
  BenefitTab, BenefitContent, fadeInUp, containerStagger 
} from '../components/LandingComponents';
import Logo from '../components/Logo';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gov-200 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <Logo size={32} className="text-accent-600 group-hover:text-accent-700 transition-colors" />
          <span className="text-xl font-bold text-gov-900 tracking-tight">Schemz</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gov-600 hover:text-accent-600 font-medium transition-colors">Features</a>
          <a href="#how-it-works" className="text-gov-600 hover:text-accent-600 font-medium transition-colors">How It Works</a>
          <a href="#benefits" className="text-gov-600 hover:text-accent-600 font-medium transition-colors">Benefits</a>
          <div className="flex items-center space-x-3 ml-4">
            <Link to="/login" className="text-gov-700 hover:text-gov-900 font-medium text-sm px-3 py-1.5">
              Log In
            </Link>
            <Link 
              to="/register" 
              className="bg-accent-600 text-white hover:bg-accent-700 shadow-md hover:shadow-lg transition-all rounded-lg px-4 py-2 text-sm font-medium flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-gov-700 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-white border-b border-gov-200 shadow-lg overflow-hidden"
        >
          <div className="px-6 py-6 space-y-4 flex flex-col">
            <a href="#features" className="text-gov-700 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-gov-700 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <hr className="border-gov-100" />
            <Link to="/login" className="text-gov-700 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link to="/register" className="bg-accent-600 text-white text-center rounded-lg py-3 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-b from-accent-50/50 to-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-accent-200/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div 
            initial="initial"
            animate="whileInView"
            variants={containerStagger}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-accent-50 border border-accent-100 text-accent-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
              </span>
              <span>New Schemes Added Daily</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gov-900 tracking-tight leading-[1.1] mb-6">
              Find the Right <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-400">Government Scheme</span>
              <br /> in Minutes
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gov-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Stop searching through endless documents. Our smart eligibility engine 
              matches you with the schemes you actually qualify for, instantly.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-accent-600 text-white hover:bg-accent-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all rounded-xl px-8 py-4 font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>Check Eligibility</span>
                <ChevronRight size={20} />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-white text-gov-700 border border-gov-200 hover:bg-gov-50 shadow-sm hover:shadow-md transition-all rounded-xl px-8 py-4 font-semibold text-lg"
              >
                Organizer Login
              </Link>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center lg:justify-start space-x-8 text-gov-500 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>100% Free for Citizens</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>Secure Data</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating UI Mock */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[4/5] md:aspect-square lg:aspect-auto bg-white rounded-2xl shadow-strong border border-gov-100 p-6 animate-float">
              {/* Mock Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-accent-100" />
                  <div className="space-y-1">
                    <div className="w-24 h-3 bg-gov-200 rounded" />
                    <div className="w-16 h-2 bg-gov-100 rounded" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gov-50" />
              </div>
              
              {/* Mock Content */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-accent-50 border border-accent-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-32 h-4 bg-accent-200 rounded" />
                    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Eligible</div>
                  </div>
                  <div className="w-full h-2 bg-accent-100 rounded mb-2" />
                  <div className="w-2/3 h-2 bg-accent-100 rounded" />
                </div>
                
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-gov-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-28 h-4 bg-gov-200 rounded" />
                    </div>
                    <div className="w-full h-2 bg-gov-100 rounded mb-2" />
                    <div className="w-1/2 h-2 bg-gov-100 rounded" />
                  </div>
                ))}
              </div>

              {/* Decorative Elements */}
              <div className="absolute -right-12 top-1/4 bg-white p-4 rounded-xl shadow-lg border border-gov-100 animate-float delay-700 hidden md:block">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-gov-900">Eligibility Confirmed</p>
                    <p className="text-gov-500">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Matching Engine",
      description: "Our algorithm analyzes your profile against thousands of schemes to find matches in seconds."
    },
    {
      icon: ShieldCheck,
      title: "Verified & Secure",
      description: "All data is encrypted. We only list verified government schemes from official sources."
    },
    {
      icon: FileText,
      title: "One-Click Apply",
      description: "Apply to multiple schemes with a single profile. No need to re-enter data every time."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get notified instantly when new schemes match your profile or applications are updated."
    }
  ];

  return (
    <SectionWrapper id="features" className="bg-white">
      <motion.div 
        initial="initial"
        whileInView="whileInView"
        variants={fadeInUp}
        className="text-center mb-16"
      >
        <span className="text-accent-600 font-semibold tracking-wider text-sm uppercase">Why Choose Schemz</span>
        <h2 className="text-3xl md:text-4xl font-bold text-gov-900 mt-3 mb-4">Built for Transparency & Speed</h2>
        <p className="text-lg text-gov-600 max-w-2xl mx-auto">
          We simplify the complex world of government benefits into a clean, easy-to-use platform.
        </p>
      </motion.div>

      <motion.div 
        variants={containerStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {features.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
};

const HowItWorksSection = () => {
  return (
    <SectionWrapper id="how-it-works" className="bg-gov-50">
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        className="text-center mb-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gov-900 mb-4">How It Works</h2>
        <p className="text-lg text-gov-600">Three simple steps to claim your benefits.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-12 relative">
        <StepCard 
          number="1" 
          title="Create Profile" 
          description="Sign up and enter your basic details like age, income, and location." 
        />
        <StepCard 
          number="2" 
          title="Get Matched" 
          description="Our engine instantly lists all schemes you are eligible for." 
        />
        <StepCard 
          number="3" 
          title="Apply & Track" 
          description="Submit applications directly and track their status in real-time." 
          isLast
        />
      </div>
    </SectionWrapper>
  );
};

const BenefitsTabSection = () => {
  const [activeTab, setActiveTab] = useState('citizen');

  return (
    <SectionWrapper id="benefits" className="bg-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gov-900 mb-6">Who is Schemz for?</h2>
        <div className="inline-flex bg-transparent p-1.5 rounded-full border border-gov-100">
          <BenefitTab 
            active={activeTab === 'citizen'} 
            onClick={() => setActiveTab('citizen')} 
            label="Citizens" 
            icon={Users}
          />
          <BenefitTab 
            active={activeTab === 'organizer'} 
            onClick={() => setActiveTab('organizer')} 
            label="Organizers" 
            icon={FileText}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gov-100">
        {activeTab === 'citizen' ? (
          <BenefitContent 
            title="Empowering Citizens" 
            image="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?auto=format&fit=crop&q=80&w=800"
            items={[
              "Discover hidden benefits you didn't know about",
              "Save time with paperless applications",
              "Track status without visiting government offices",
              "Secure document locker for all your certificates"
            ]} 
          />
        ) : (
          <BenefitContent 
            title="Tools for Government & Organizers" 
            image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800"
            items={[
              "Create and manage schemes with a visual rule builder",
              "Streamline application review process",
              "Reduce fraudulent claims with verified data",
              "Real-time analytics and reporting dashboard"
            ]} 
          />
        )}
      </div>
    </SectionWrapper>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gov-50 border-t border-gov-200 py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Logo size={24} className="text-gov-400" />
          <span className="text-gov-600 font-semibold">Schemz</span>
        </div>
        <div className="text-gov-500 text-sm">
          &copy; {new Date().getFullYear()} Schemz. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const Landing = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return (
    <div className="min-h-screen font-sans text-gov-900 selection:bg-accent-100 selection:text-accent-900">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsTabSection />
      <Footer />
    </div>
  );
};

export default Landing;
