import React from 'react';
import { FolderOpen, Activity, Cpu, Music, Settings, BookOpen, Plus } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onNewExperiment: () => void;
}

export default function Sidebar({ currentTab, setTab, onNewExperiment }: SidebarProps) {
  // Profiles dynamic updates matching screenshot requirements
  const getProfile = () => {
    switch (currentTab) {
      case 'datasets':
        return {
          name: 'Alex Chen',
          role: 'Senior Architect',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfIypWC5Zyi6Bgz0bmbNq_yBoKgvrllVhiSRz7MvouEziwXhzQiwbSM9LL7A31BscO5qz1sXHys9wL74m8NsMLqWwS7Oxa8m0m3QqGzpPj-_bp4ZgOHjNUcn6MkeNMEtz3IlI7zr9V_mYgQihViB43Sfewejvr7KgoAhnt6caXP1wdjMQJqVPciLkf88Muu2I_LTi1hM-wecBDcsA6ROWnIZ51aLWiyofQRpqZUGlZOcF5Ucgu-667'
        };
      case 'preprocessing':
        return {
          name: 'Lab_User_01',
          role: 'Premium Tier',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQFE-s_Kr4OGQwoCIrWHPQvyzkpbkmoYa5UIKbnTv3pC52daIwVU52KvY6cI2V5gPDNoTChQJw7s_2y_i9IAIiowlCPDZRZnoI-6HNLaTzdspg_pwrI4csIuexrCYXMt8BNjtKyubW8ggKosxCvKrqomEJ3ciBr1VYCAVpk6js6-9eq09p-bsmB0jgvwbLqfkNxUYefjdAE6EfIbBRWZ6nHOK6dMDsreF-3HufO1X6_aKphSFJSiBs'
        };
      case 'model-lab':
      case 'studio':
      default:
        return {
          name: 'researcher_01',
          role: 'Tier: ARCHITECT',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOApWKPDxhQ_DqyfJ6YSLUYOXBsqxxh8IS6S5QNQ0vaLhlTZ8C34JpGr1aVcO3KSdrLRLwYNC5L5tT2RQY0InHMohMqzIZKi07eW37lxSXruohJptX9I5wCU9cRuBqiYNFGxnZCKzVxwAmZ9OrmhJM6nLFabX4liupeMnc6uE80ySNQo0bs4umPRUfjJQlT_tE4N0l-pUyO63N5jmRCW80dNfvl5nN5qoxt07w8cNKGUEhybYVSdNb'
        };
    }
  };

  const profile = getProfile();

  const navItems = [
    { id: 'datasets', label: 'Datasets', icon: FolderOpen },
    { id: 'preprocessing', label: 'Preprocessing', icon: Activity },
    { id: 'model-lab', label: 'Model Lab', icon: Cpu },
    { id: 'studio', label: 'Studio', icon: Music },
  ];

  return (
    <aside id="sidebar-panel" className="fixed left-0 top-0 h-full w-[320px] bg-[#1c1b1b] border-r border-white/5 backdrop-blur-xl flex flex-col py-8 z-40">
      {/* Brand logo */}
      <div className="px-8 mb-12">
        <h1 className="font-sans text-2xl font-bold text-[#d0bcff] tracking-tight">NeuralSound</h1>
        <p className="font-mono text-xs text-[#cbc3d7]/60 mt-1 uppercase tracking-wider">v2.4.0-beta</p>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-left cursor-pointer ${
                isActive
                  ? 'text-[#d0bcff] bg-[#d0bcff]/10 border-r-2 border-[#d0bcff]'
                  : 'text-[#cbc3d7] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-sans font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer controls & Profile */}
      <div className="px-4 mt-auto space-y-2">
        {/* New Experiment Button */}
        <button
          onClick={onNewExperiment}
          className="w-full py-4 mb-4 rounded-xl bg-[#d0bcff] text-[#3c0091] font-bold active:scale-95 duration-100 shadow-lg shadow-[#d0bcff]/20 flex items-center justify-center gap-2 hover:brightness-110 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Experiment</span>
        </button>

        {/* Static controls */}
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-[#cbc3d7] hover:text-white hover:bg-white/5 text-left cursor-pointer">
          <Settings className="w-5 h-5" />
          <span className="font-sans text-sm">Settings</span>
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-[#cbc3d7] hover:text-white hover:bg-white/5 text-left cursor-pointer">
          <BookOpen className="w-5 h-5" />
          <span className="font-sans text-sm">Docs</span>
        </button>

        {/* User Block */}
        <div className="flex items-center gap-3 p-4 mt-6 border-t border-white/5">
          <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
            <img
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              src={profile.avatar}
              alt={profile.name}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-sm font-medium text-white truncate">{profile.name}</span>
            <span className="text-[10px] text-[#cbc3d7]/50 uppercase tracking-widest truncate">{profile.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
