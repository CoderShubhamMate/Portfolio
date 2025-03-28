import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/three';

function InteractiveModel({ url, scale = 1 }) {
  const modelRef = useRef();
  const [clicked, setClicked] = useState(false);
  const { scene } = useGLTF(url);

  const { scale: springScale, position, rotation } = useSpring({
    scale: clicked ? 1.5 * scale : scale,
    position: clicked ? [0, 0, -2] : [0, 0, 0],
    rotation: clicked ? [0, Math.PI, 0] : [0, 0, 0],
    config: { mass: 1, tension: 180, friction: 12 },
  });

  return (
    <Canvas style={{ height: '400px' }} camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <animated.mesh
        ref={modelRef}
        scale={springScale}
        position={position}
        rotation={rotation}
        onClick={() => setClicked(!clicked)}
      >
        <primitive object={scene} />
      </animated.mesh>
    </Canvas>
  );
}

export default InteractiveModel;
