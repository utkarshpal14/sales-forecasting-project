import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Orb = () => {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(time) * 0.2;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
      
      // Shift colors between indigo (#6366f1) and cyan (#22d3ee)
      const color1 = new THREE.Color('#6366f1');
      const color2 = new THREE.Color('#22d3ee');
      const mixRatio = (Math.sin(time * 0.5) + 1) / 2;
      meshRef.current.material.color.lerpColors(color1, color2, mixRatio);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <MeshDistortMaterial
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive="#22d3ee"
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
};

export default function FloatingOrb() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#6366f1" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#22d3ee" />
        <Orb />
      </Canvas>
    </div>
  );
}
