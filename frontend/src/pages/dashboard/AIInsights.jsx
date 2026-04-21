import React, { useState, useEffect } from 'react';
import { Cpu, ShieldPlus, AlertCircle, Zap, Lock, Users, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInsights = () => {
  const [analysisData, setAnalysisData] = useState(null);

  // Load analysis data from localStorage
  useEffect(() => {
    const loadAnalysisData = () => {
      const stored = localStorage.getItem('secureops_analysis');
      if (stored) {
        try {
          setAnalysisData(JSON.parse(stored));
        } catch (e) {
          // Failed to parse analysis data, use default empty state
          setAnalysisData({ summary: '', insights: [], recommendations: [] });
        }
      }
    };

    loadAnalysisData();
    window.addEventListener('storage', loadAnalysisData);
    return () => window.removeEventListener('storage', loadAnalysisData);
  }, []);

  // Generate recommendations based on analysis data
  const generateRecommendations = (data) => {
    if (!data || !data.metrics) {
      return [
        {
          title: "Update Firewall Ruleset Alpha",
          description: "Based on recent access patterns, modifying rule #402 can prevent potential brute-force attempts from subnet 10.0.x.x.",
          impact: "High Impact",
          icon: ShieldPlus,
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20"
        },
        {
          title: "Rotate Database Credentials",
          description: "Admin credentials for main DB haven't been rotated in 90 days. Policy suggests 60-day rotation.",
          impact: "Medium Impact",
          icon: AlertCircle,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/20"
        },
        {
          title: "Optimize Log Archiving",
          description: "Current storage metrics suggest moving logs older than 30 days to cold storage to reduce costs by 15%.",
          impact: "Efficiency",
          icon: Zap,
          color: "text-cyber-neon",
          bg: "bg-cyan-500/10",
          border: "border-cyber-neon/20"
        }
      ];
    }

    const recommendations = [];
    const { failed_logins = 0, successful_logins = 0, total_ips = 0 } = data.metrics;

    // Brute force protection recommendation
    if (failed_logins > 0) {
      recommendations.push({
        title: "Strengthen Authentication Security",
        description: `Detected ${failed_logins} failed login attempts. Consider implementing account lockout policies and multi-factor authentication.`,
        impact: "High Impact",
        icon: Lock,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20"
      });
    }

    // User access monitoring
    if (successful_logins > 0) {
      recommendations.push({
        title: "Monitor User Access Patterns",
        description: `${successful_logins} successful logins from ${total_ips} unique IPs. Review access logs for unusual patterns.`,
        impact: "Medium Impact",
        icon: Users,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
      });
    }

    // Log management
    if (data.metrics.total_lines > 10) {
      recommendations.push({
        title: "Optimize Log Management",
        description: `Processed ${data.metrics.total_lines} log entries. Consider implementing log rotation and archival policies.`,
        impact: "Efficiency",
        icon: Database,
        color: "text-cyber-neon",
        bg: "bg-cyan-500/10",
        border: "border-cyber-neon/20"
      });
    }

    // Default recommendations if no specific insights
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Regular Security Audits",
        description: "Schedule regular security audits to maintain optimal system health and identify potential vulnerabilities.",
        impact: "Preventive",
        icon: ShieldPlus,
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations(analysisData);

  // Calculate health score based on analysis
  const calculateHealthScore = (data) => {
    if (!data || !data.metrics) return 92;

    const { failed_logins = 0, total_lines = 0 } = data.metrics;
    const threatRatio = total_lines > 0 ? (failed_logins / total_lines) * 100 : 0;

    // Health score decreases with more failed logins
    let score = 100 - (threatRatio * 2);
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = calculateHealthScore(analysisData);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Cpu className="h-8 w-8 text-cyber-purple" /> AI Intelligent Insights
        </h1>
        <p className="text-gray-400 mt-1">Proactive security recommendations powered by Machine Learning</p>
      </div>

      <div className="glass-panel p-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyber-purple/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

        <div className="relative z-10">
           <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-neon to-cyber-purple mb-4">
             System Health Score: {healthScore}/100
           </h2>
           <p className="text-gray-300 max-w-2xl mb-6">
             {analysisData
               ? `Analysis of ${analysisData.metrics?.total_lines || 0} log entries completed. ${analysisData.findings?.length || 0} potential security concerns identified.`
               : "Your infrastructure is currently operating within acceptable parameters. Our analysis engine has identified potential areas for optimization to harden your defenses further."
             }
           </p>

           <div className="w-full bg-cyber-900 rounded-full h-2.5 mb-2 mt-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyber-neon h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              ></div>
           </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mt-10 mb-4 px-2">Actionable Recommendations</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-panel p-6 border transition-all hover:-translate-y-1 ${rec.border} flex flex-col h-full`}
          >
            <div className={`p-3 rounded-lg inline-flex w-fit ${rec.bg} mb-4`}>
              <rec.icon className={`h-6 w-6 ${rec.color}`} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{rec.title}</h4>
            <p className="text-gray-400 text-sm flex-1">{rec.description}</p>

            <div className="mt-6 flex items-center justify-between">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rec.bg} ${rec.color}`}>
                {rec.impact}
              </span>
              <button className="text-sm text-cyber-neon hover:text-white transition-colors">Apply Fix →</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
