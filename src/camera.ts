import * as THREE from "three";
import * as CANNON from "cannon-es";

export class GameCamera extends THREE.Camera {
  gCamera: THREE.Camera;

  offset = new THREE.Vector3(0, 16, 16);

  // TODO: possibly add multiple camera modes to toggle between
  // e.g. Traversal Orbit, follow Object

  constructor() {
    super();
    this.gCamera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  }

  updateCameraPos(player: CANNON.Body) {
    const targetCameraPosition = new THREE.Vector3();
    targetCameraPosition.copy(player.position).add(this.offset);
    this.gCamera.position.lerp(targetCameraPosition, 0.5);

    // Vector facing outwards from camera
    const cameraFacingDirection = new THREE.Vector3(0, 0, -1).normalize();

    // Calculate direction vector from camera to target
    const direction = new THREE.Vector3().subVectors(
      player.position,
      this.gCamera.position
    );

    const angleRadians = cameraFacingDirection.angleTo(direction);
    const axis = new THREE.Vector3()
      .crossVectors(cameraFacingDirection, direction)
      .normalize();
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      axis,
      angleRadians
    );
    this.gCamera.quaternion.copy(quaternion);
  }
}
