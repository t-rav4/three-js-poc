import React from "react";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";
import { ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function GameCamera(props: ThreeElements["perspectiveCamera"]) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  useFrame(() => {
    // Optionally add custom camera logic here, e.g., animations
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 5, 10]}
      fov={75}
    />
  );
}
