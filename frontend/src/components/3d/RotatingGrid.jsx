import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const Grid = () => {
  const gridRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.position.z = (time * 2) % 2;
    }
  });

  return (
    <gridHelper ref={gridRef} args={[40, 40, '#6366f1', '#1e1e2e']} position={[0, -2, 0]} />
  );
};

export default function RotatingGrid() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ perspective: '800px' }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }} gl={{ alpha: true }}>
        <fog attach="fog" args={['#0a0a0f', 5, 25]} />
        <ambientLight intensity={0.5} />
        <Grid />
        {/* Additional grids to create infinite effect */}
        <group position={[0, 0, -20]}>
          <gridHelper args={[40, 40, '#6366f1', '#1e1e2e']} position={[0, -2, 0]} />
        </group>
      </Canvas>
    </div>
  );
}
