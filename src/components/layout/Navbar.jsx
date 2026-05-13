import { useState, useEffect } from 'react';
import { Bell, Clock, Cpu, LayoutDashboard } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const machines = useStore((state) => state.machines);
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const alertsCount = machines.filter(m => m.status === 'ERROR' || m.status === 'WARNING').length;

  return (
    <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-industrial-bg/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center border border-brand-primary/30 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
          <Cpu className="text-brand-primary w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">
            GARMENT<span className="text-brand-primary">FLOW</span>
            <span className="ml-1 text-xs font-light text-white/50 border border-white/20 px-1.5 py-0.5 rounded tracking-tighter">TWIN v1.0</span>
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest -mt-1 font-semibold">AI Industry 4.0 Orchestrator</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">System Health</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 w-3 rounded-full ${i <= 4 ? 'bg-status-running shadow-[0_0_5px_#00ff88]' : 'bg-white/10'}`} />
              ))}
            </div>
            <span className="text-xs text-status-running font-mono">98.2%</span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-white/40" />
            <span className="text-xs font-mono text-white/70">{machines.length} <span className="text-white/30">UNITS</span></span>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <Bell className={`w-4 h-4 ${alertsCount > 0 ? 'text-status-error animate-pulse' : 'text-white/40'}`} />
            <span className={`text-xs font-mono ${alertsCount > 0 ? 'text-status-error' : 'text-white/70'}`}>
              {alertsCount} <span className="text-white/30">ALERTS</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-xs font-mono text-white/70">{time.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
