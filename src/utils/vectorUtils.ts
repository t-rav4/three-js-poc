import * as THREE from "three";
import * as CANNON from "cannon-es";

export function threeVecToCannon(vec: THREE.Vector3) {
  return new CANNON.Vec3(vec.x, vec.y, vec.z);
}

export function cannonVecToThree(vec: CANNON.Vec3) {
  return new THREE.Vector3(vec.x, vec.y, vec.z);
}
