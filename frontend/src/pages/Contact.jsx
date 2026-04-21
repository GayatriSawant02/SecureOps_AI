import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <div className="min-h-screen bg-cyber-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-800 to-black">
      <Navbar />
      <div className="pt-32 max-w-3xl mx-auto px-4 z-10 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Establish Connection</h1>
          <p className="text-lg text-gray-400">Reach out to our response team for implementation or support inquiries.</p>
        </motion.div>

        <div className="glass-panel p-8">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject Name</label>
                <input type="text" className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Comm Channel (Email)</label>
                <input type="email" className="input-field" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Transmission Data</label>
              <textarea rows="5" className="input-field" placeholder="Enter your message..."></textarea>
            </div>
            <button className="btn-primary w-full">TRANSMIT</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
