import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows,
  BakeShadows,
  KeyboardControls
} from '@react-three/drei';
import { useStore } from '../../store/useStore';
import { Machine } from './Machine';
import { Floor } from './Floor';
import { WorkflowLines } from './WorkflowLines';

export const FactoryCanvas = () => {
  const machines = useStore((state) => state.machines);
  const selectedMachineId = useStore((state) => state.selectedMachineId);
  const selectMachine = useStore((state) => state.selectMachine);

  return (
    <div className="w-full h-full bg-industrial-bg relative">
      {/* Background UI Elements */}
      <div className="absolute inset-0 factory-grid pointer-events-none opacity-20" />
      
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={40} />
        <OrbitControls 
          makeDefault 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={5} 
          maxDistance={40}
          enableDamping
          dampingFactor={0.05}
        />

        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, 5, -10]} intensity={1} color="#7000ff" />
          
          <group>
            {machines.map((m) => (
              <Machine 
                key={m.id}
                {...m}
                isSelected={selectedMachineId === m.id}
              />
            ))}
          </group>

          <WorkflowLines />
          <Floor />

          <ContactShadows 
            position={[0, -0.49, 0]} 
            opacity={0.4} 
            scale={40} 
            blur={2} 
            far={1} 
            resolution={512} 
            color="#000000" 
          />
        </Suspense>
        
        <BakeShadows />
      </Canvas>

      {/* Control Tips */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
        {[
          { key: 'LMB', action: 'Rotate' },
          { key: 'RMB', action: 'Pan' },
          { key: 'Scroll', action: 'Zoom' },
          { key: 'Click', action: 'Inspect' }
        ].map((tip, i) => (
          <div key={i} className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
            <span className="text-[10px] font-bold text-brand-primary font-mono">{tip.key}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">{tip.action}</span>
          </div>
        ))}
      </div>

      {machines.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-brand-primary/20 flex items-center justify-center animate-pulse">
            <div className="w-24 h-24 rounded-full border border-brand-primary/40 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-brand-primary/60" />
            </div>
          </div>
          <h3 className="text-white/20 text-sm font-bold uppercase tracking-[0.3em] mt-8">Empty Factory Floor</h3>
          <p className="text-white/10 text-[10px] mt-2 uppercase tracking-widest">Select assets from the sidebar to begin orchestration</p>
        </div>
      )}
    </div>
  );
};
