import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { MACHINE_TYPES } from '../../data/machineTypes';

export const Machine = ({ id, type, name, position, status, isSelected }) => {
  const meshRef = useRef();
  const wheelRef = useRef();
  const selectMachine = useStore((state) => state.selectMachine);
  const updateMachinePosition = useStore((state) => state.updateMachinePosition);
  
  const [hovered, setHovered] = useState(false);
  
  const machineInfo = Object.values(MACHINE_TYPES).find(t => t.id === type);
  
  const statusColors = {
    RUNNING: '#00ff88',
    IDLE: '#ffd700',
    WARNING: '#ff8c00',
    ERROR: '#ff4444',
    MAINTENANCE: '#00d4ff'
  };

  const statusColor = statusColors[status] || '#ffffff';

  useFrame((state, delta) => {
    if (wheelRef.current && status === 'RUNNING') {
      wheelRef.current.rotation.x += delta * 5;
    }
    
    if (meshRef.current) {
      // Gentle floating animation if selected
      if (isSelected) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        meshRef.current.position.y = 0;
      }
    }
  });

  return (
    <group 
      position={position} 
      onClick={(e) => {
        e.stopPropagation();
        selectMachine(id);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={meshRef}>
          {/* Base Platform */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[1.5, 0.2, 1.2]} />
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 0.8, 0.8]} />
            <meshStandardMaterial color={isSelected ? "#333" : "#1a1a1a"} metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Machine Head */}
          <mesh position={[0.2, 0.6, 0]}>
            <boxGeometry args={[1.2, 0.4, 0.4]} />
            <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
          </mesh>

          {/* Moving Mechanical Element (Wheel) */}
          <mesh ref={wheelRef} position={[0.6, 0.6, 0.25]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
            <meshStandardMaterial color="#444" metalness={1} />
          </mesh>

          {/* Status Light */}
          <mesh position={[-0.4, 0.6, 0.25]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              emissive={statusColor} 
              emissiveIntensity={status === 'ERROR' || status === 'WARNING' ? Math.sin(Date.now() * 0.01) * 5 + 5 : 2} 
              color={statusColor} 
            />
          </mesh>
          
          <pointLight position={[-0.4, 0.6, 0.25]} distance={2} intensity={2} color={statusColor} />

          {/* Selection Highlight */}
          {isSelected && (
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.7, 1.4, 1.4]} />
              <meshBasicMaterial color="#00f2ff" transparent opacity={0.1} wireframe />
            </mesh>
          )}

          {/* Hover Tooltip */}
          {hovered && !isSelected && (
            <Html distanceFactor={10} position={[0, 1.5, 0]}>
              <div className="bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">{name}</p>
                <p className="text-[8px] text-white/40 font-mono mt-0.5">{status} | {type}</p>
              </div>
            </Html>
          )}
          
          {/* Label */}
          <Text
            position={[0, -0.7, 0.8]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {name.split(' #')[1] ? `#${name.split(' #')[1]}` : name}
          </Text>
        </group>
      </Float>
    </group>
  );
};
