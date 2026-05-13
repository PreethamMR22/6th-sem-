import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export const WorkflowLines = () => {
  const connections = useStore((state) => state.connections);
  const machines = useStore((state) => state.machines);

  return (
    <group>
      {connections.map((conn) => {
        const source = machines.find(m => m.id === conn.source);
        const target = machines.find(m => m.id === conn.target);
        
        if (!source || !target) return null;

        return (
          <ConnectionLine 
            key={conn.id} 
            start={source.position} 
            end={target.position} 
          />
        );
      })}
    </group>
  );
};

const ConnectionLine = ({ start, end }) => {
  const lineRef = useRef();
  
  const midPoint = [
    (start[0] + end[0]) / 2,
    1,
    (start[2] + end[2]) / 2
  ];

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.dashOffset -= 0.01;
    }
  });

  return (
    <group>
      <QuadraticBezierLine
        ref={lineRef}
        start={start}
        end={end}
        mid={midPoint}
        color="#00f2ff"
        lineWidth={2}
        transparent
        opacity={0.5}
        dashed
        dashScale={20}
        dashSize={0.5}
        dashOffset={0}
      />
      
      {/* Glow */}
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={midPoint}
        color="#00f2ff"
        lineWidth={6}
        transparent
        opacity={0.1}
      />
    </group>
  );
};
