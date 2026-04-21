import React from 'react';
import { ShieldCheck, ShieldAlert, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Overview = () => {
  const stats = [
    { label: 'System Status', value: 'Optimal', icon: ShieldCheck, color: 'text-green-500', border: 'border-green-500/30' },
    { label: 'Threat Level', value: 'Moderate', icon: ShieldAlert, color: 'text-yellow-500', border: 'border-yellow-500/30' },
    { label: 'Active Alerts', value: '24', icon: Activity, color: 'text-red-500', border: 'border-red-500/30' },
    { label: 'Active Users', value: '1,204', icon: Users, color: 'text-blue-500', border: 'border-blue-500/30' },
  ];

  const recentActivity = [
    { time: '10:42 AM', action: 'Failed login attempt (Admin)', ip: '192.168.1.105', risk: 'Medium' },
    { time: '09:15 AM', action: 'Firewall rules updated', ip: 'Internal', risk: 'Low' },
    { time: '08:30 AM', action: 'Malware signature detected', ip: '10.0.0.4', risk: 'High' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Security Overview</h1>
          <p className="text-gray-400 mt-1">Real-time telemetry and state analysis</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-outline">Download Report</button>
          <Link to="/dashboard/chatbot" className="btn-primary">Ask AI Ops</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card ${stat.border}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <h3 className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-cyber-700 pb-2">Recent Activity Logs</h3>
          <div className="space-y-4">
            {recentActivity.map((log, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 hover:bg-cyber-800/50 rounded-lg transition-colors border border-transparent hover:border-cyber-700">
                <div className="flex flex-col">
                  <span className="text-white font-medium">{log.action}</span>
                  <span className="text-sm text-gray-500">{log.time} • IP: {log.ip}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border
                  ${log.risk === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
                    log.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                    'bg-green-500/10 text-green-500 border-green-500/30'}`}
                >
                  {log.risk}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-cyber-700 pb-2">Quick Actions</h3>
          <div className="space-y-3">
             <button className="w-full text-left px-4 py-3 bg-cyber-800 rounded flex items-center justify-between hover:bg-cyber-700 transition">
               <span>Scan Network</span>
               <Activity className="h-4 w-4 text-cyber-neon" />
             </button>
             <button className="w-full text-left px-4 py-3 bg-cyber-800 rounded flex items-center justify-between hover:bg-cyber-700 transition">
               <span>Update Firewalls</span>
               <ShieldCheck className="h-4 w-4 text-blue-400" />
             </button>
             <button className="w-full text-left px-4 py-3 border border-red-500/30 bg-red-500/10 text-red-400 rounded flex items-center justify-between hover:bg-red-500/20 transition">
               <span>Initiate Lockdown</span>
               <ShieldAlert className="h-4 w-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
