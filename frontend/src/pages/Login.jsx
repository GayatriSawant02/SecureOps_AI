import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-purple/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-neon/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass-panel z-10 relative"
      >
        <Link to="/" className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
          ← Back
        </Link>
        <div className="text-center mb-8 mt-4">
          <Shield className="h-12 w-12 text-cyber-neon mx-auto mb-4 animate-pulse-glow" />
          <h2 className="text-3xl font-bold text-white">System Access</h2>
          <p className="text-gray-400 mt-2">Enter credentials to securely authenticate.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="Operator Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="Secure Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-400 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" className="mr-2 rounded border-cyber-700 bg-cyber-900/50 text-cyber-neon focus:ring-cyber-neon focus:ring-offset-0 focus:ring-offset-transparent" />
              Remember device
            </label>
            <a href="#" className="text-cyber-neon hover:text-white transition-colors">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium tracking-wide transition-all ${
              loading 
                ? 'bg-cyber-800 text-gray-500 cursor-not-allowed border border-cyber-700' 
                : 'bg-gradient-to-r from-cyber-purple to-blue-600 text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]'
            }`}
          >
            {loading ? 'Authenticating...' : 'INITIALIZE LOGIN'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Unregistered personnel? <Link to="/signup" className="text-cyber-neon hover:text-white transition-colors ml-1">Request Access</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
