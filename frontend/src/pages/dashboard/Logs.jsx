import React, { useState, useRef } from 'react';
import { Filter, Download, Terminal, Upload, FileText, AlertCircle, CheckCircle, X, CloudUpload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

const Logs = () => {
  const { getAuthHeaders } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const apiService = new ApiService({ getAuthHeaders });

  const mockLogs = [
    { id: '10293', date: '2023-10-27 14:02:11', user: 'SYSTEM', event: 'Firewall rules updated', type: 'INFO' },
    { id: '10294', date: '2023-10-27 14:15:33', user: 'admin_ops', event: 'Manual override on Port 22', type: 'WARN' },
    { id: '10295', date: '2023-10-27 14:18:01', user: 'SYSTEM', event: 'Failed authentication attempt', type: 'ERROR' },
    { id: '10296', date: '2023-10-27 14:22:45', user: 'jdoe', event: 'Accessed sensitive directory /var/log/auth', type: 'WARN' },
    { id: '10297', date: '2023-10-27 14:50:10', user: 'SYSTEM', event: 'Routine malware scan completed', type: 'INFO' },
    { id: '10298', date: '2023-10-27 15:05:22', user: 'UNKNOWN', event: 'Unauthorized protocol detected on Intranet', type: 'ERROR' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['text/plain', 'application/octet-stream'];
      const allowedExtensions = ['.log', '.txt'];

      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

      if (!isValidType) {
        setError('Please select a valid log file (.log or .txt)');
        return;
      }

      if (!isValidSize) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setAnalysisResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await apiService.uploadLogFile(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysisResult(result);

      // Store analysis result in localStorage for other components to access
      localStorage.setItem('secureops_analysis', JSON.stringify(result));
      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event('storage'));

      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const logs = analysisResult ? [] : mockLogs; // Show mock logs when no analysis result
  const filteredLogs = logs.filter(log => filter === 'ALL' || log.type === filter);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Terminal className="h-8 w-8 text-cyber-neon" /> System Logs
          </h1>
          <p className="text-gray-400 mt-1">Raw telemetry and event history</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Enhanced File Upload Section */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CloudUpload className="h-5 w-5 text-cyber-neon" />
          Upload Log File for Analysis
        </h3>

        {/* Drag and Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-cyber-neon bg-cyber-neon/10'
              : 'border-cyber-700 hover:border-cyber-neon/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".log,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="log-file-input"
            ref={fileInputRef}
          />

          {!selectedFile ? (
            <div>
              <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-300 mb-2">
                Drag and drop your log file here, or{' '}
                <label htmlFor="log-file-input" className="text-cyber-neon hover:text-white cursor-pointer underline">
                  browse files
                </label>
              </p>
              <p className="text-sm text-gray-500">Supports .log and .txt files up to 5MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <FileText className="h-8 w-8 text-cyber-neon" />
              <div className="text-left">
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Uploading and analyzing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-cyber-700 rounded-full h-2">
              <div
                className="bg-cyber-neon h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Analyze Log File
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Analysis Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-cyber-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Total Lines</div>
              <div className="text-2xl font-bold text-white">{analysisResult.metrics?.total_lines || 0}</div>
            </div>
            <div className="bg-cyber-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Unique IPs</div>
              <div className="text-2xl font-bold text-white">{analysisResult.metrics?.total_ips || 0}</div>
            </div>
            <div className="bg-cyber-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Failed Logins</div>
              <div className="text-2xl font-bold text-white">{analysisResult.metrics?.failed_logins || 0}</div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">Summary</h4>
            <p className="text-gray-300 bg-cyber-800 p-3 rounded-lg">{analysisResult.summary}</p>
          </div>

          {analysisResult.findings && analysisResult.findings.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2">Threat Findings</h4>
              <div className="space-y-2">
                {analysisResult.findings.map((finding, index) => (
                  <div key={index} className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                    <div className="text-red-400 font-medium">{finding.type?.toUpperCase()}</div>
                    <div className="text-gray-300 text-sm">{finding.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {['ALL', 'INFO', 'WARN', 'ERROR'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-full text-xs font-medium transition-colors border ${
              filter === f
                ? 'bg-cyber-neon/20 text-cyber-neon border-cyber-neon/50'
                : 'bg-cyber-800 text-gray-400 border-cyber-700 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="glass-panel overflow-hidden font-mono text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cyber-900 border-b border-cyber-700 text-gray-500">
                <th className="p-3 font-normal">TIMESTAMP</th>
                <th className="p-3 font-normal">TYPE</th>
                <th className="p-3 font-normal">USER/PROCESS</th>
                <th className="p-3 font-normal w-1/2">EVENT DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-700/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-cyber-800/30 transition-colors">
                  <td className="p-3 text-gray-400">{log.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border
                      ${log.type === 'ERROR' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                        log.type === 'WARN' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/30'}`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 text-cyber-neon">{log.user}</td>
                  <td className="p-3 text-gray-300">{log.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-gray-500 italic">
              {analysisResult ? 'No logs to display after analysis.' : 'No logs found for the selected filter.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
