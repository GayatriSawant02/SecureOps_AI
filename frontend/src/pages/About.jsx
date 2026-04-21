import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-cyber-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-800 to-black">
      <Navbar />
      <div className="pt-32 max-w-4xl mx-auto px-4 z-10 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-neon to-cyber-purple mb-6">About SecureOps AI</h1>
          <p className="text-lg text-gray-400">Pioneering the future of intelligent cybersecurity operations.</p>
        </motion.div>
        
        <div className="glass-panel p-8 space-y-6 text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-semibold text-white border-b border-cyber-700 pb-2">Our Mission</h2>
          <p>
            SecureOps AI was built with a singular vision: to democratize advanced security operations. 
            By integrating artificial intelligence natively into the defense workflow, we empower teams of all sizes 
            to respond to threats with the speed and precision of a world-class SOC.
          </p>
          
          <h2 className="text-2xl font-semibold text-white border-b border-cyber-700 pb-2 mt-8">Core Technologies</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Large Language Models (LLMs) trained specifically on cybersecurity playbooks.</li>
            <li>Real-time autonomous threat hunting algorithms.</li>
            <li>Predictive behavior analytics.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
