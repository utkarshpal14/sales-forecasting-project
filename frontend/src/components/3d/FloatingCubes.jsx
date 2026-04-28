import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const Cube = ({ position, speed }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * speed.x;
      meshRef.current.rotation.y = time * speed.y;
      meshRef.current.position.y = position[1] + Math.sin(time * speed.y) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial 
        color="#22d3ee" 
        transmission={0.9} 
        opacity={1} 
        metalness={0.1} 
        roughness={0.1} 
        ior={1.5} 
        thickness={0.5}
      />
    </mesh>
  );
};

export default function FloatingCubes() {
  const cubes = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 5
      ],
      speed: {
        x: Math.random() * 0.5 + 0.1,
        y: Math.random() * 0.5 + 0.1
      }
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />
        {cubes.map((cube, i) => (
          <Cube key={i} position={cube.position} speed={cube.speed} />
        ))}
      </Canvas>
    </div>
  );
}
