import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  MessageCircle, 
  Users, 
  MapPin, 
  Pill, 
  Stethoscope,
  Lock,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Brain,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const shouldReduceMotion = useReducedMotion();

  const features = [
    {
      icon: MessageCircle,
      title: 'AI-Powered Chat',
      description: 'Get instant medical guidance from our advanced AI assistant trained on medical knowledge.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'Your health data is protected with military-grade AES-256-GCM encryption.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Find Doctors',
      description: 'Connect with qualified healthcare professionals and book consultations instantly.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: MapPin,
      title: 'Locate Hospitals',
      description: 'Find nearby hospitals and medical facilities with real-time directions.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Pill,
      title: 'Medicine Management',
      description: 'Track medications, set reminders, and order prescriptions with ease.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Activity,
      title: 'Health Monitoring',
      description: 'Monitor your health metrics and receive personalized recommendations.',
      gradient: 'from-teal-500 to-blue-500'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Users' },
    { number: '500+', label: 'Medical Experts' },
    { number: '24/7', label: 'AI Support' },
    { number: '99.9%', label: 'Uptime' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const floatingVariants = {
    animate: shouldReduceMotion ? {} : {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Clynic AI - Your first stop for all your medical needs</title>
        <meta name="description" content="Experience the future of healthcare with our AI-powered platform. Get instant medical guidance, find doctors, locate hospitals, and manage your health—all with military-grade security." />
        <meta name="keywords" content="healthcare AI, medical assistant, find doctors, hospital locator, health management, secure healthcare" />
        <link rel="canonical" href="https://clynic-ai.com" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={shouldReduceMotion ? {} : {
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={shouldReduceMotion ? {} : {
              rotate: [360, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-accent-500/10 to-primary-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={shouldReduceMotion ? {} : {
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-secondary-500/5 to-accent-500/5 rounded-full blur-2xl"
          />
        </div>

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow-primary">
              <Heart className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-dark-200 bg-clip-text text-transparent">
                Clynic AI
              </h1>
              <p className="text-xs text-dark-400">Healthcare Reimagined</p>
            </div>
          </div>
          
          <Button
            onClick={onGetStarted}
            variant="outline"
            size="sm"
            className="border-primary-500/30 text-primary-400 hover:bg-primary-500/10"
          >
            Sign In
          </Button>
        </motion.nav>

        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-6 py-20 lg:py-32"
        >
          <div className="max-w-6xl mx-auto">
            {/* Floating Medical Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-20 left-10 text-primary-400/20"
              >
                <Stethoscope size={40} aria-hidden="true" />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                transition={{ delay: 1 }}
                className="absolute top-32 right-16 text-secondary-400/20"
              >
                <Brain size={35} aria-hidden="true" />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                transition={{ delay: 2 }}
                className="absolute bottom-40 left-20 text-accent-400/20"
              >
                <Activity size={30} aria-hidden="true" />
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                Powered by Advanced AI
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-primary-200 to-secondary-200 bg-clip-text text-transparent">
                Clynic AI
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl lg:text-3xl text-primary-300 font-medium mb-4"
            >
              Your First Stop For All Your Medical Needs
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-dark-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Experience the future of healthcare with our AI-powered platform. Get instant medical guidance, 
              find doctors, locate hospitals, and manage your health—all with military-grade security.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
            >
              <Button
                onClick={onGetStarted}
                size="xl"
                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-8 py-4 text-lg font-semibold shadow-glow-primary group"
                rightIcon={
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                }
              >
                Get Started Free
              </Button>
              
              <div className="flex items-center space-x-2 text-dark-400">
                <CheckCircle className="w-5 h-5 text-success-400" aria-hidden="true" />
                <span>No credit card required</span>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-dark-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 px-6 py-20 lg:py-32"
          id="features"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything You Need for
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"> Better Health</span>
              </h2>
              <p className="text-xl text-dark-300 max-w-3xl mx-auto">
                Our comprehensive platform combines cutting-edge AI with robust security to deliver 
                personalized healthcare solutions at your fingertips.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                    whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                    whileHover={shouldReduceMotion ? {} : { y: -5, scale: 1.02 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      hover: { duration: 0.2 }
                    }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    <div className="h-full p-8 bg-dark-800/30 backdrop-blur-xl border border-dark-700/50 rounded-2xl hover:border-primary-500/30 transition-all duration-300 hover:shadow-soft-xl">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-300 transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-dark-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Security Section */}
        <motion.section
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 px-6 py-20 lg:py-32"
          id="security"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-dark-800/50 to-dark-900/50 backdrop-blur-xl border border-dark-700/50 rounded-3xl p-8 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: -30 }}
                  whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-6">
                    <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                    HIPAA Compliant & Secure
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Your Privacy is Our
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Top Priority</span>
                  </h2>
                  
                  <p className="text-lg text-dark-300 mb-8 leading-relaxed">
                    Every piece of your health data is protected with military-grade AES-256-GCM encryption. 
                    We ensure complete privacy and security, giving you peace of mind while managing your health.
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      'End-to-end encryption for all communications',
                      'HIPAA compliant data handling',
                      'Zero-knowledge architecture',
                      'Regular security audits and updates'
                    ].map((item, index) => (
                      <motion.div
                        key={item}
                        initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                        whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="w-5 h-5 text-success-400 flex-shrink-0" aria-hidden="true" />
                        <span className="text-dark-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: 30 }}
                  whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="relative">
                    <div className="w-full h-80 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 flex items-center justify-center">
                      <motion.div
                        animate={shouldReduceMotion ? {} : {
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        <Shield className="w-32 h-32 text-green-400" aria-hidden="true" />
                      </motion.div>
                    </div>
                    
                    {/* Floating security badges */}
                    <motion.div
                      animate={shouldReduceMotion ? {} : { y: [-5, 5, -5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-4 -right-4 bg-dark-800 border border-green-500/30 rounded-xl p-3"
                    >
                      <Lock className="w-6 h-6 text-green-400" aria-hidden="true" />
                    </motion.div>
                    
                    <motion.div
                      animate={shouldReduceMotion ? {} : { y: [5, -5, 5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                      className="absolute -bottom-4 -left-4 bg-dark-800 border border-green-500/30 rounded-xl p-3"
                    >
                      <CheckCircle className="w-6 h-6 text-green-400" aria-hidden="true" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 px-6 py-20 lg:py-32"
          id="get-started"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"> Healthcare Experience?</span>
              </h2>
              
              <p className="text-xl text-dark-300 mb-12 max-w-2xl mx-auto">
                Join thousands of users who trust Clynic AI for their healthcare needs. 
                Start your journey to better health today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button
                  onClick={onGetStarted}
                  size="xl"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-12 py-4 text-lg font-semibold shadow-glow-primary group"
                  rightIcon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  }
                >
                  Start Your Health Journey
                </Button>
                
                <div className="flex items-center space-x-4 text-dark-400">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                  </div>
                  <span className="text-sm">Trusted by 10,000+ users</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 border-t border-dark-700/50 px-6 py-12"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Clynic AI</h3>
                  <p className="text-xs text-dark-400">Healthcare Reimagined</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-dark-400">
                <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              </div>
              
              <div className="text-sm text-dark-500">
                © 2024 Clynic AI. All rights reserved.
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </>
  );
}