import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

// Animation Variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Section Wrapper Component
 * Handles consistent padding and entrance animations
 */
export const SectionWrapper = ({ children, className = "", id = "" }) => {
  return (
    <section id={id} className={`py-20 md:py-32 relative overflow-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {children}
      </div>
    </section>
  );
};

/**
 * Feature Card Component
 * Displays a feature with icon, title, and description
 */
export const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white rounded-xl p-8 border border-gov-100 shadow-soft hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
    >
      <div className="w-14 h-14 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center mb-6 group-hover:bg-accent-600 group-hover:text-white transition-colors duration-300">
        <Icon size={28} className="group-hover:rotate-6 transition-transform duration-300" />
      </div>
      <h3 className="text-xl font-bold text-gov-900 mb-3">{title}</h3>
      <p className="text-gov-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

/**
 * Step Card Component
 * Displays a step in the "How It Works" section
 */
export const StepCard = ({ number, title, description, isLast = false }) => {
  return (
    <motion.div variants={fadeInUp} className="relative flex-1">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-white border-2 border-accent-100 text-accent-600 flex items-center justify-center text-2xl font-bold shadow-sm mb-6 relative z-10 group-hover:border-accent-600 transition-colors">
          {number}
        </div>
        {!isLast && (
          <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-gov-100 -z-0" />
        )}
        <h3 className="text-xl font-bold text-gov-900 mb-3">{title}</h3>
        <p className="text-gov-600 leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>
    </motion.div>
  );
};

/**
 * Benefit Tab Component
 * Tab button for switching between user types in Benefits section
 */
export const BenefitTab = ({ active, onClick, label, icon: Icon }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-accent-600 text-white shadow-md'
          : 'bg-white text-gov-600 hover:bg-gov-50 border border-gov-200'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {active && <motion.div layoutId="activeTab" className="" />}
    </button>
  );
};

/**
 * Benefit Content Component
 * Displays list of benefits for the selected user type
 */
export const BenefitContent = ({ title, items, image }) => {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="grid md:grid-cols-2 gap-12 items-center"
    >
      <div className="space-y-8">
        <h3 className="text-3xl font-bold text-gov-900">{title}</h3>
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-start space-x-3">
              <CheckCircle2 className="text-accent-600 mt-1 flex-shrink-0" size={20} />
              <span className="text-gov-700 text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="relative rounded-2xl shadow-strong border border-gov-100 w-full object-cover aspect-[4/3]"
        />
      </div>
    </motion.div>
  );
};
