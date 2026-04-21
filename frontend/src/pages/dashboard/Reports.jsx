import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, FileText } from 'lucide-react';

const data = [
  { name: 'Mon', threats: 400, mitigated: 240 },
  { name: 'Tue', threats: 300, mitigated: 139 },
  { name: 'Wed', threats: 200, mitigated: 980 },
  { name: 'Thu', threats: 278, mitigated: 390 },
  { name: 'Fri', threats: 189, mitigated: 480 },
  { name: 'Sat', threats: 239, mitigated: 380 },
  { name: 'Sun', threats: 349, mitigated: 430 },
];

const trafficData = [
  { name: '00:00', in: 4000, out: 2400 },
  { name: '04:00', in: 3000, out: 1398 },
  { name: '08:00', in: 2000, out: 9800 },
  { name: '12:00', in: 2780, out: 3908 },
  { name: '16:00', in: 1890, out: 4800 },
  { name: '20:00', in: 2390, out: 3800 },
  { name: '24:00', in: 3490, out: 4300 },
];

const Reports = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Analytics & Reports</h1>
          <p className="text-gray-400 mt-1">Visualize threat landscapes and system metrics</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="h-4 w-4" /> Generate Full Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-cyber-700 pb-2">Weekly Threat Mitigation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMitigated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#66FCF1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#66FCF1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2833" vertical={false} />
                <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#1F2833', borderRadius: '8px' }} 
                  itemStyle={{ fontSize: '14px' }}
                />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" />
                <Area type="monotone" dataKey="mitigated" stroke="#66FCF1" fillOpacity={1} fill="url(#colorMitigated)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-cyber-700 pb-2">Network Traffic (24h)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2833" vertical={false} />
                <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1F2833', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#1F2833', borderRadius: '8px' }}
                />
                <Bar dataKey="in" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Available Reports list */}
      <h3 className="text-xl font-bold text-white mt-10 mb-4">Saved Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
           <div key={i} className="glass-card flex items-start gap-4 hover:border-cyber-neon/50 cursor-pointer">
             <div className="p-3 bg-cyber-900 border border-cyber-700 rounded-lg">
                <FileText className="h-6 w-6 text-cyber-neon" />
             </div>
             <div>
               <h4 className="font-semibold text-gray-200">System Audit Q{i}</h4>
               <p className="text-xs text-gray-500 mt-1">Generated: Oct 1{i}, 2023</p>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
