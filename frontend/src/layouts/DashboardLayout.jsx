import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-cyber-900 overflow-hidden text-gray-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 glass-panel rounded-none border-t-0 border-l-0 border-r-0 flex items-center justify-between px-8 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search logs, threats, queries..." 
                className="w-full bg-cyber-900/80 border border-cyber-700 focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon rounded-full pl-10 pr-4 py-2 text-sm text-gray-200 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-cyber-neon transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-cyber-red rounded-full ring-2 ring-cyber-900"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-cyber-700 block">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyber-purple to-blue-500 flex items-center justify-center border border-cyber-neon/50">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">{user?.name || 'Operator'}</div>
                <div className="text-xs text-cyber-neon">{user?.role || 'System Admin'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Output */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyber-800/40 via-cyber-900 to-black p-8 relative pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
