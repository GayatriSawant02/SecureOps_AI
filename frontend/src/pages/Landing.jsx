import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-cyber-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-800 via-cyber-900 to-black overflow-hidden relative">
      {/* Background abstract elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyber-purple/20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-neon/30 bg-cyber-800/40 backdrop-blur-sm text-cyber-neon font-medium text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Next-Gen Security Operations</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-purple">
                Threat Defense
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              Elevate your cybersecurity posture. SecureOps AI automates threat detection, log analysis, and incident response with state-of-the-art conversational AI.
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <Link to="/login" className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/about" className="btn-outline text-lg px-8 py-3">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyber-purple/30 to-cyber-neon/10 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="relative glass-panel p-8 w-full max-w-md aspect-square rounded-full flex flex-col items-center justify-center border-cyber-neon/50 border-2">
              <div className="absolute inset-0 rounded-full border border-cyber-purple border-dashed opacity-50 animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-full border border-cyber-neon border-dotted opacity-50 animate-[spin_15s_linear_infinite_reverse]"></div>
              <Shield className="w-32 h-32 text-cyber-neon mb-4" />
              <h3 className="text-2xl font-bold text-white text-center">Protected System</h3>
              <div className="flex gap-2 mt-4 text-cyber-neon">
                <Lock className="w-5 h-5" />
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
