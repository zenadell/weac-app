import React, { useRef } from 'react';
import { View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';

function CardMesh({ rarity }) {
  const mesh = useRef(null);
  
  useFrame((state, delta) => {
    if (mesh.current) {
      // Gentle floating and rotation
      mesh.current.rotation.y += delta * 0.4;
      mesh.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const isMythic = rarity === 'Mythic';
  const color = isMythic ? '#C084FC' : '#FFAC80';

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[2, 3, 0.05]} />
      <meshStandardMaterial 
        color={color} 
        metalness={isMythic ? 0.9 : 0.4} 
        roughness={isMythic ? 0.1 : 0.6} 
      />
    </mesh>
  );
}

export function Card3D({ rarity = 'Epic', style }) {
  return (
    <View style={style} className="bg-transparent overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <CardMesh rarity={rarity} />
      </Canvas>
    </View>
  );
}
