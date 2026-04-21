import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, AlertTriangle, Eye, ShieldCheck, TrendingUp, RefreshCw, Play, Pause, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, AreaChart, Area, ComposedChart } from 'recharts';

const ThreatDetection = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [realTimeData, setRealTimeData] = useState([]);
  const [selectedChart, setSelectedChart] = useState('severity');
  const intervalRef = useRef(null);

  // Load analysis data from localStorage (shared between components)
  useEffect(() => {
    const loadAnalysisData = () => {
      const stored = localStorage.getItem('secureops_analysis');
      if (stored) {
        try {
          setAnalysisData(JSON.parse(stored));
        } catch (e) {
          // Failed to parse analysis data, use default empty state
          setAnalysisData({ threats: [], summary: '' });
        }
      }
    };

    loadAnalysisData();
    // Listen for storage changes (when analysis is updated in Logs page)
    window.addEventListener('storage', loadAnalysisData);
    return () => window.removeEventListener('storage', loadAnalysisData);
  }, []);

  // Real-time data simulation
  useEffect(() => {
    if (isRealTimeEnabled) {
      intervalRef.current = setInterval(() => {
        setRealTimeData(prev => {
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          const newDataPoint = {
            time: timeString,
            threats: Math.floor(Math.random() * 5) + (prev.length > 0 ? prev[prev.length - 1].threats : 0),
            critical: Math.floor(Math.random() * 2),
            high: Math.floor(Math.random() * 3),
            medium: Math.floor(Math.random() * 4),
            low: Math.floor(Math.random() * 6),
            traffic: Math.floor(Math.random() * 1000) + 500
          };

          // Keep only last 20 data points
          const updated = [...prev, newDataPoint];
          return updated.length > 20 ? updated.slice(-20) : updated;
        });
      }, 3000); // Update every 3 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRealTimeEnabled]);

  // Generate threats from analysis data
  const generateThreatsFromAnalysis = (data) => {
    if (!data || !data.findings) return [];

    return data.findings.map((finding, index) => ({
      id: `TRT-${String(1000 + index).slice(-3)}`,
      type: finding.type === 'brute_force' ? 'Brute Force Attack' : 'Suspicious Activity',
      source: finding.ip || 'Unknown IP',
      severity: finding.type === 'brute_force' ? 'High' : 'Medium',
      status: 'Active',
      time: 'Just now',
      description: finding.description,
      count: finding.count || 1
    }));
  };

  const mockThreats = [
    { id: 'TRT-892', type: 'DDoS Attack Attempt', source: 'Multiple IPs', severity: 'High', status: 'Active', time: '2 mins ago', count: 1 },
    { id: 'TRT-891', type: 'Privilege Escalation', source: 'User-Host-02', severity: 'Critical', status: 'Mitigated', time: '1 hr ago', count: 1 },
    { id: 'TRT-890', type: 'Malware Pattern', source: 'Email Att.', severity: 'Medium', status: 'Quarantined', time: '3 hrs ago', count: 1 },
    { id: 'TRT-889', type: 'Failed Auth Spike', source: '10.0.0.8', severity: 'Low', status: 'Monitoring', time: '5 hrs ago', count: 1 },
  ];

  const threats = analysisData ? generateThreatsFromAnalysis(analysisData) : mockThreats;

  const getSeverityStyle = (sev) => {
    switch(sev) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  // Calculate metrics from analysis data
  const totalThreats = threats.length;
  const criticalThreats = threats.filter(t => t.severity === 'Critical').length;
  const mitigatedThreats = threats.filter(t => t.status === 'Mitigated').length;

  // Prepare chart data
  const severityData = [
    { name: 'Critical', value: criticalThreats, color: '#ef4444' },
    { name: 'High', value: threats.filter(t => t.severity === 'High').length, color: '#f97316' },
    { name: 'Medium', value: threats.filter(t => t.severity === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: threats.filter(t => t.severity === 'Low').length, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  const threatTypeData = threats.reduce((acc, threat) => {
    const existing = acc.find(item => item.name === threat.type);
    if (existing) {
      existing.value += threat.count;
    } else {
      acc.push({ name: threat.type, value: threat.count });
    }
    return acc;
  }, []);

  // Real-time timeline data
  const timelineData = realTimeData.length > 0 ? realTimeData : [
    { time: '00:00', threats: 0, critical: 0, high: 0, medium: 0, low: 0, traffic: 500 },
    { time: '04:00', threats: 1, critical: 0, high: 1, medium: 0, low: 0, traffic: 600 },
    { time: '08:00', threats: 2, critical: 0, high: 1, medium: 1, low: 0, traffic: 800 },
    { time: '12:00', threats: totalThreats, critical: criticalThreats, high: threats.filter(t => t.severity === 'High').length, medium: threats.filter(t => t.severity === 'Medium').length, low: threats.filter(t => t.severity === 'Low').length, traffic: 1200 },
    { time: '16:00', threats: totalThreats + 1, critical: criticalThreats, high: threats.filter(t => t.severity === 'High').length + 1, medium: threats.filter(t => t.severity === 'Medium').length, low: threats.filter(t => t.severity === 'Low').length, traffic: 1000 },
    { time: '20:00', threats: totalThreats + 2, critical: criticalThreats, high: threats.filter(t => t.severity === 'High').length + 1, medium: threats.filter(t => t.severity === 'Medium').length + 1, low: threats.filter(t => t.severity === 'Low').length, traffic: 700 },
  ];

  // Traffic analysis data
  const trafficData = timelineData.map(point => ({
    time: point.time,
    traffic: point.traffic,
    threats: point.threats
  }));

  // Render selected chart
  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'severity':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar yAxisId="left" dataKey="threats" fill="#22d3ee" name="Total Threats" />
              <Line yAxisId="right" type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={3} name="Critical" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'traffic':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="traffic" stackId="1" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.6} name="Network Traffic" />
              <Area type="monotone" dataKey="threats" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Threats Detected" />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Threat Detection Center</h1>
          <p className="text-gray-400 mt-1">Identify, analyze, and neutralize potential risks</p>
        </div>

        {/* Real-time Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Real-time:</span>
            <button
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isRealTimeEnabled
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-cyber-800 text-gray-400 border border-cyber-700 hover:border-cyber-neon/50'
              }`}
            >
              {isRealTimeEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRealTimeEnabled ? 'Active' : 'Paused'}
            </button>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyber-800 border border-cyber-700 rounded-lg text-gray-400 hover:border-cyber-neon/50 hover:text-white transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card flex flex-col">
          <div className="text-gray-400 mb-2">Total Threats (24h)</div>
          <div className="text-4xl font-bold text-white">{totalThreats}</div>
          <div className="text-sm text-green-500 mt-2">
            {analysisData ? 'Latest analysis' : '↓ 12% from yesterday'}
          </div>
        </div>
        <div className="glass-card flex flex-col border-red-500/30">
           <div className="text-gray-400 mb-2 items-center flex gap-2">
             <AlertTriangle className="h-4 w-4 text-red-500"/> Critical Action Needed
           </div>
          <div className="text-4xl font-bold text-red-500">{criticalThreats}</div>
          <div className="text-sm text-red-400 mt-2">
            {criticalThreats > 0 ? 'Requires immediate response' : 'No critical threats'}
          </div>
        </div>
        <div className="glass-card flex flex-col border-blue-500/30">
          <div className="text-gray-400 mb-2 items-center flex gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-500"/> Auto-Mitigated
          </div>
          <div className="text-4xl font-bold text-blue-500">{mitigatedThreats}</div>
          <div className="text-sm text-gray-400 mt-2">
            {mitigatedThreats > 0 ? 'Handled by SecureOps Policy' : 'No auto-mitigated threats'}
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyber-neon" />
            Interactive Threat Analytics
          </h3>

          {/* Chart Type Selector */}
          <div className="flex gap-2">
            {[
              { id: 'severity', label: 'Severity', icon: PieChartIcon },
              { id: 'timeline', label: 'Timeline', icon: LineChartIcon },
              { id: 'traffic', label: 'Traffic', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedChart(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedChart === id
                    ? 'bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50'
                    : 'bg-cyber-800 text-gray-400 border border-cyber-700 hover:border-cyber-neon/50 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Chart */}
        <div className="mb-4">
          {renderSelectedChart()}
        </div>

        {/* Chart Legend/Info */}
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            {selectedChart === 'severity' && 'Distribution of threat severities across all detected incidents'}
            {selectedChart === 'timeline' && 'Real-time threat activity and critical alerts over time'}
            {selectedChart === 'traffic' && 'Network traffic patterns with threat correlation overlay'}
          </div>
          <div className="flex items-center gap-2">
            {isRealTimeEnabled && (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Data
              </>
            )}
          </div>
        </div>
      </div>

      {/* Threat Types Overview - Keep the bar chart */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyber-neon" />
          Threat Types Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={threatTypeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-cyber-700 flex justify-between items-center bg-cyber-800/50">
          <h3 className="text-lg font-bold text-white">Threat Logbook</h3>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-cyber-900 border border-cyber-700 rounded text-sm hover:border-cyber-neon/50">Filter</button>
             <button className="px-3 py-1 bg-cyber-900 border border-cyber-700 rounded text-sm hover:border-cyber-neon/50">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cyber-900 text-gray-400 text-sm border-b border-cyber-700">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Threat Type</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Time</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-700/50">
              {threats.map((t) => (
                <tr key={t.id} className="hover:bg-cyber-800/30 transition-colors">
                  <td className="p-4 text-gray-300 font-mono text-sm">{t.id}</td>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    {t.severity === 'Critical' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                    {t.type}
                  </td>
                  <td className="p-4 text-gray-300">{t.source}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityStyle(t.severity)}`}>
                      {t.severity}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{t.status}</td>
                  <td className="p-4 text-gray-400 text-sm">{t.time}</td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button className="p-1.5 hover:bg-cyber-700 rounded text-gray-400 hover:text-white" title="Analyze">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {threats.length === 0 && (
            <div className="p-8 text-center text-gray-500 italic">
              {analysisData ? 'No threats detected in the latest analysis.' : 'No threats detected.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatDetection;
