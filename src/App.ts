import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { StarManager } from "./components/stars";

export class App {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  torus!: THREE.Mesh;
  starManager: StarManager;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const canvas = document.querySelector("#bg") as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.starManager = new StarManager(this.scene);

    this.init();
  }

  init() {
    // Set up camera and renderer
    this.camera.position.z = -40;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff);
    const gridHelper = new THREE.GridHelper(200, 50);

    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
    });
    this.torus = new THREE.Mesh(geometry, material);

    this.scene.add(light, gridHelper, this.torus);
  }

  animate() {
    this.renderer.render(this.scene, this.camera);

    this.controls.update();

    this.torus.rotateY(0.02);

    this.starManager.animateStars();

    requestAnimationFrame(() => this.animate());
  }
}
