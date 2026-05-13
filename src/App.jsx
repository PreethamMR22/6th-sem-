import React, { useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { InspectionPanel } from './components/layout/InspectionPanel';
import { FactoryCanvas } from './components/factory/FactoryCanvas';
import { useTelemetry } from './hooks/useTelemetry';
import { useStore } from './store/useStore';
import { MACHINE_TYPES } from './data/machineTypes';

function App() {
  // Initialize telemetry simulation
  useTelemetry();
  
  const addMachine = useStore((state) => state.addMachine);
  const machines = useStore((state) => state.machines);
  const addConnection = useStore((state) => state.addConnection);

  // Add initial machines for a better first impression
  useEffect(() => {
    if (machines.length === 0) {
      addMachine(MACHINE_TYPES.LOCKSTITCH, [-4, 0, 0]);
      addMachine(MACHINE_TYPES.OVERLOCK, [0, 0, 0]);
      addMachine(MACHINE_TYPES.QUALITY_CHECK, [4, 0, 0]);
      
      // We need IDs to connect, so we'll let the user do it or wait for store to update
      // For now, let's just leave it empty and let user play
    }
  }, []);

  // Try to connect them once they are added
  useEffect(() => {
    if (machines.length >= 3 && useStore.getState().connections.length === 0) {
      const ids = machines.map(m => m.id);
      addConnection(ids[0], ids[1]);
      addConnection(ids[1], ids[2]);
    }
  }, [machines]);

  return (
    <div className="h-screen w-screen flex flex-col bg-industrial-bg overflow-hidden text-white selection:bg-brand-primary selection:text-black">
      {/* HUD Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-brand-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-brand-secondary/5 to-transparent" />
        
        {/* Animated Background Particles/Scanner lines could go here */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-px w-full bg-brand-primary/20 absolute top-1/4 animate-[scan_8s_linear_infinite]" />
          <div className="h-px w-full bg-brand-primary/20 absolute top-3/4 animate-[scan_12s_linear_infinite]" />
        </div>
      </div>

      <Navbar />
      
      <main className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        
        <div className="flex-1 relative">
          <FactoryCanvas />
        </div>
        
        <InspectionPanel />
      </main>

      <style jsx global>{`
        @keyframes scan {
          from { transform: translateY(-100vh); }
          to { transform: translateY(100vh); }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-brand-primary);
        }
      `}</style>
    </div>
  );
}

export default App;
