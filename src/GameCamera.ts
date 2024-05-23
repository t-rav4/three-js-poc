import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/Addons.js";

enum CameraMode {
  Player,
  World,
}

export class GameCamera extends THREE.PerspectiveCamera {
  gCamera: THREE.PerspectiveCamera;
  offset = new THREE.Vector3(0, 16, 16);
  renderer: THREE.WebGLRenderer;

  orbitControls: OrbitControls;

  currentMode: CameraMode = CameraMode.Player;

  constructor(renderer: THREE.WebGLRenderer) {
    super();

    this.gCamera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.orbitControls = new OrbitControls(this.gCamera, renderer.domElement);
    this.orbitControls.enableDamping = true; // Adds some drag to the camera movement

    this.renderer = renderer;

    window.addEventListener("resize", () => this.onWindowResize());
  }

  toggleCameraMode() {
    if (this.currentMode == CameraMode.Player) {
      this.orbitControls.enabled = true;
      this.currentMode = CameraMode.World;
    } else {
      this.orbitControls.enabled = false;
      this.currentMode = CameraMode.Player;
    }
  }

  updateCameraPos(player: CANNON.Body) {
    if (this.currentMode == CameraMode.World) {
      this.orbitControls.update();
      return;
    }

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

  onWindowResize() {
    this.gCamera.aspect = window.innerWidth / window.innerHeight;
    this.gCamera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
