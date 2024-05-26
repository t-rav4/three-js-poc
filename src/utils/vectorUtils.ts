import * as THREE from "three";
import * as CANNON from "cannon-es";

export function threeVecToCannon(vec: THREE.Vector3) {
  return new CANNON.Vec3(vec.x, vec.y, vec.z);
}

export function cannonVecToThree(vec: CANNON.Vec3) {
  return new THREE.Vector3(vec.x, vec.y, vec.z);
}

export function getRandomVector3(min = 0) {
  const x = generateRandomCoordinate(min, 200);
  const y = 3;
  const z = generateRandomCoordinate(min, 200);

  return new THREE.Vector3(x, y, z);
}

function generateRandomCoordinate(min: number, max: number): number {
  const coordinate = Math.random() * (max - min) + min;
  return Math.random() < 0.5 ? -coordinate : coordinate;
}
