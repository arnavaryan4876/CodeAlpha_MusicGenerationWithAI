import React from 'react';
import { Search, Bell, Cpu, Cloud } from 'lucide-react';

interface HeaderProps {
  title?: string;
  searchPlaceholder?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function Header({
  title = 'Neural Audio Workstation',
  searchPlaceholder = 'Search...',
  searchQuery,
  setSearchQuery
}: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-320px)] h-16 bg-[#131313]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-30">
      <div className="flex items-center gap-8">
        <span className="font-sans text-xl font-bold text-white tracking-tight">{title}</span>
        <div className="hidden md:flex items-center gap-4 text-sm text-[#cbc3d7]">
          <span className="h-4 w-px bg-white/10" />
          <a href="#" className="text-[#5de6ff] font-mono font-bold hover:brightness-110">Project Alpha</a>
          <span className="text-white/20">/</span>
          <a href="#" className="font-mono hover:text-white">Training Logs</a>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#353534]/50 border border-white/10 rounded-full pl-10 pr-4 py-1.5 w-64 text-sm text-white focus:outline-none focus:border-[#d0bcff] focus:ring-0 transition-all outline-none"
            placeholder={searchPlaceholder}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#cbc3d7] w-4.5 h-4.5" />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4 text-[#cbc3d7]">
          <button className="relative p-1 hover:text-[#d0bcff] transition-all cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#5de6ff] rounded-full animate-pulse" />
          </button>
          <button className="p-1 hover:text-[#d0bcff] transition-all cursor-pointer" title="Hardware Memory Metrics">
            <Cpu className="w-5 h-5" />
          </button>
          <button className="p-1 text-[#5de6ff] hover:brightness-110 transition-all cursor-pointer" title="Synced to Cloud">
            <Cloud className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
