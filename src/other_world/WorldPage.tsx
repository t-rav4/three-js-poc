import React, { useEffect } from "react";
import * as THREE from "three";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import GameCamera from "./Camera";

export default function WorldPage() {
  function Box(props: ThreeElements["mesh"]) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);
    useFrame((state, delta) => {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime());
      // meshRef.current.rotation.y -= delta;
    });
    return (
      <mesh
        {...props}
        ref={meshRef}
        scale={active ? 1.5 : 1}
        onClick={(event) => setActive(!active)}
        onPointerOver={(event) => setHover(true)}
        onPointerOut={(event) => setHover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      </mesh>
    );
  }

  function Plane(props: ThreeElements["mesh"]) {
    const meshRef = useRef<THREE.Mesh>(null!);
    useEffect(() => {
      if (meshRef.current) {
        meshRef.current.setRotationFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          -Math.PI / 2
        );
      }
    }, []);
    return (
      <mesh {...props} ref={meshRef}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#7cc100" />
      </mesh>
    );
  }

  return (
    <Canvas style={{ height: "100vh", width: "100vw" }}>
      {/* <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} /> */}
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

      <GameCamera />
      <Plane position={[0, 0, 0]} scale={[5, 5, 1]} />
    </Canvas>
  );
}
