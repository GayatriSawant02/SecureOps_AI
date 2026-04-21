import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShieldAlert, 
  FileText, 
  BarChart, 
  Cpu, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'AI Chatbot', path: '/dashboard/chatbot', icon: MessageSquare },
    { name: 'Threat Detection', path: '/dashboard/threats', icon: ShieldAlert },
    { name: 'System Logs', path: '/dashboard/logs', icon: FileText },
    { name: 'Reports', path: '/dashboard/reports', icon: BarChart },
    { name: 'AI Insights', path: '/dashboard/insights', icon: Cpu },
  ];

  return (
    <div className="w-64 h-full glass-panel rounded-none border-t-0 border-b-0 border-l-0 flex flex-col pt-6">
      <div className="px-6 mb-8 flex items-center gap-3">
        <ShieldAlert className="h-8 w-8 text-cyber-neon" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-neon to-cyber-purple">
          SECUREOPS
        </span>
      </div>

      <div className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 ml-2 mt-4">
          Core Focus
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-cyber-800 text-cyber-neon border border-cyber-neon/30 shadow-[0_0_10px_rgba(102,252,241,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-cyber-800/50'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 ml-2 mt-8">
          Preferences
        </div>

        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'bg-cyber-800 text-white border border-cyber-700' 
                : 'text-gray-400 hover:text-white hover:bg-cyber-800/50'
            }`
          }
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
      </div>

      <div className="p-4 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex flex-row items-center justify-center gap-2 w-full py-3 bg-cyber-800/50 border border-cyber-700/50 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
