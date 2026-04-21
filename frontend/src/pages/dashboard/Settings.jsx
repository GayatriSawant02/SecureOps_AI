import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, User, Bell, Shield, Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and platform preferences</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-cyber-700 bg-cyber-800/50 p-4 font-semibold text-white flex items-center gap-2">
          <User className="h-5 w-5 text-cyber-neon" /> Profile Information
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Display Name</label>
              <input type="text" className="input-field" defaultValue={user?.name || ''} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Address</label>
              <input type="email" className="input-field" defaultValue={user?.email || ''} readOnly />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <input type="text" className="input-field bg-cyber-900 border-none text-cyber-neon" defaultValue={user?.role || ''} readOnly disabled />
            </div>
          </div>
          <button className="btn-primary mt-4 flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Profile
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-cyber-700 bg-cyber-800/50 p-4 font-semibold text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyber-purple" /> Security Preferences
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-white font-medium mb-1">Change Password</h4>
            <p className="text-sm text-gray-400 mb-4">Ensure your account is using a long, random password to stay secure.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <input type="password" placeholder="Current Password" className="input-field" />
              <input type="password" placeholder="New Password" className="input-field" />
            </div>
            <button className="btn-outline mt-4">Update Password</button>
          </div>
          
          <hr className="border-cyber-700" />
          
          <div className="flex items-center justify-between max-w-2xl">
            <div>
              <h4 className="text-white font-medium mb-1">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-400">Add additional security to your account using 2FA.</p>
            </div>
            <button className="px-4 py-2 bg-cyber-800 border border-cyber-neom rounded text-cyber-neon font-medium hover:bg-cyber-700 transition">Enable</button>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-cyber-700 bg-cyber-800/50 p-4 font-semibold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-400" /> Appearance & Notifications
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between max-w-2xl">
            <div>
              <h4 className="text-white font-medium mb-1">Theme Preference</h4>
              <p className="text-sm text-gray-400">Toggle between Light and Dark interface.</p>
            </div>
            <div className="flex bg-cyber-900 border border-cyber-700 rounded-lg p-1">
              <button 
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${theme === 'light' ? 'bg-cyber-800 text-white' : 'text-gray-500'}`}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${theme === 'dark' ? 'bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/30' : 'text-gray-500'}`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>

          <hr className="border-cyber-700" />

          <div className="space-y-4 max-w-2xl">
            <h4 className="text-white font-medium">Alert Notifications</h4>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-400">Critical Threat Alerts (Email)</span>
              <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-cyber-neon rounded border-cyber-700 bg-cyber-900 focus:ring-cyber-neon focus:ring-offset-0 focus:ring-offset-transparent" />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-400">Weekly Summary Reports</span>
              <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-cyber-neon rounded border-cyber-700 bg-cyber-900 focus:ring-cyber-neon focus:ring-offset-0 focus:ring-offset-transparent" />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-400">Login Activity Anomalies</span>
              <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-cyber-neon rounded border-cyber-700 bg-cyber-900 focus:ring-cyber-neon focus:ring-offset-0 focus:ring-offset-transparent" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
