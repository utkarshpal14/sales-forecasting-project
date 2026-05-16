import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const BarChart = () => {
  const groupRef = useRef();
  
  // Create 6 bars
  const bars = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      position: [(i - 2.5) * 1.2, 0, 0],
      baseHeight: 1 + Math.random() * 2,
      phase: i * 0.5,
      color: new THREE.Color().lerpColors(
        new THREE.Color('#6366f1'), // primary
        new THREE.Color('#22d3ee'), // secondary
        i / 5
      )
    }));
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Rotate the whole chart slowly
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.2;
    }
    
    // Animate individual bars
    groupRef.current.children.forEach((mesh, i) => {
      const bar = bars[i];
      // Sin wave animation for height
      const heightOffset = Math.sin(time * 1.5 + bar.phase) * 0.5;
      const currentHeight = Math.max(0.1, bar.baseHeight + heightOffset);
      
      mesh.scale.y = currentHeight;
      // Position Y so it grows upwards from center (since geometry is centered)
      mesh.position.y = currentHeight / 2 - 1.5; 
    });
  });

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => (
        <mesh key={i} position={[bar.position[0], 0, bar.position[2]]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1, 0.8]} />
          <meshStandardMaterial 
            color={bar.color} 
            emissive={bar.color}
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

const Particles = () => {
  const pointsRef = useRef();
  
  const particlesCount = 150;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const col = new Float32Array(particlesCount * 3);
    const c1 = new THREE.Color('#6366f1');
    const c2 = new THREE.Color('#22d3ee');
    for(let i = 0; i < particlesCount; i++) {
      const mixed = c1.clone().lerp(c2, Math.random());
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return col;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05;
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
      
      // Slight reaction to mouse
      const mouseX = (state.pointer.x * Math.PI) / 10;
      const mouseY = (state.pointer.y * Math.PI) / 10;
      
      pointsRef.current.rotation.y += (mouseX - pointsRef.current.rotation.y) * 0.05;
      pointsRef.current.rotation.x += (mouseY - pointsRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particlesCount} 
          array={positions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-color" 
          count={particlesCount} 
          array={colors} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.1} 
        vertexColors 
        transparent 
        opacity={0.6}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const AuthBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <BarChart />
        </Float>
        
        <Particles />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default AuthBackground;
