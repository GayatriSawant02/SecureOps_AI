import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'text-cyber-neon border-b-2 border-cyber-neon' : 'text-gray-300 hover:text-white transition-colors';
  };

  return (
    <nav className="fixed w-full z-50 glass-panel border-b-0 rounded-none bg-cyber-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyber-neon animate-pulse-glow" />
            <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyber-neon to-cyber-purple">
              SECUREOPS AI
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className={`px-3 py-2 font-medium ${isActive('/')}`}>Home</Link>
              <Link to="/about" className={`px-3 py-2 font-medium ${isActive('/about')}`}>About Us</Link>
              <Link to="/contact" className={`px-3 py-2 font-medium ${isActive('/contact')}`}>Contact</Link>
              <Link to="/login" className="btn-outline ml-4">Sign In</Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-cyber-800 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-panel rounded-none absolute w-full left-0 top-20 border-t border-cyber-700/50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-white hover:bg-cyber-800">Home</Link>
            <Link to="/about" className="block px-3 py-2 text-base font-medium text-white hover:bg-cyber-800">About</Link>
            <Link to="/contact" className="block px-3 py-2 text-base font-medium text-white hover:bg-cyber-800">Contact</Link>
            <Link to="/login" className="block px-3 py-2 text-base font-medium text-cyber-neon mt-4 border-t border-cyber-700 pt-4">Sign In</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
