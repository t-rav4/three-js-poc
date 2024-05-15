import "./style.css";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
// import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Ball } from "./ball";
import { TextBuilder } from "./components/TextBuilder";
import { ShapeBuilder } from "./components/ShapeBuilder";
import { ModelInstance } from "./ModelInstance";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const gui = new GUI();

const canvas = document.querySelector("#bg") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // Adds some drag to the camera movement

// Instantiate the physics world
const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -30, 0),
});
// Set a default physics material to all bodies in world
physicsWorld.defaultContactMaterial = new CANNON.ContactMaterial(
  new CANNON.Material({ friction: 1.0 }),
  new CANNON.Material({ friction: 1.0 }),
  {
    friction: 1.0,
    restitution: 0,
  }
);
// Enable Cannon Physics Debugger
const cannonDebugger = CannonDebugger(scene, physicsWorld, {
  color: 0xff0000,
});

// 3d Floating Text
const textBuilder = new TextBuilder(scene);
textBuilder.createText("JAEGERSOFT", new THREE.Vector3(0, 5, -20));

// Create the Ball instance
const ball = new Ball();
scene.add(ball.getMesh());
physicsWorld.addBody(ball.getPhysicsBody());

// Set up camera, renderer, lighting
async function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  const gridHelper = new THREE.GridHelper(200, 50);
  scene.add(gridHelper);

  setupLighting();
  createPlane();
  document.body.appendChild(renderer.domElement);
}

function setupLighting() {
  const folder = gui.addFolder("Ambient light");
  const ambLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambLight);

  folder.add(ambLight, "intensity", 0, 5, 0.1).name("intensity");
  folder.open();
}

function createPlane() {
  const groundWidth = 600;
  const groundHeight = 1;
  const groundDepth = 300;
  const groundShape = new CANNON.Box(
    new CANNON.Vec3(groundWidth / 2, groundHeight / 2, groundDepth / 2)
  );
  const groundBody = new CANNON.Body({
    mass: 0,
    shape: groundShape,
    collisionFilterGroup: 3,
  });
  groundBody.position.set(0, -0.5, 0);
  physicsWorld.addBody(groundBody);

  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    "https://threejs.org/manual/examples/resources/images/checker.png"
  );
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  const planeGeo = new THREE.BoxGeometry(
    groundWidth,
    groundHeight,
    groundDepth
  );
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  scene.add(mesh);

  // Copying physics to the plane mesh
  mesh.position.copy(groundBody.position);
}

const shapeBuilder = new ShapeBuilder(scene, physicsWorld);
// shapeBuilder.createBox(10, 3, 10, new THREE.Vector3(0, 1, 10));

const modelInstance = new ModelInstance(scene, physicsWorld, shapeBuilder);
await modelInstance.importModel("models/half-pipe.glb");

function render() {
  requestAnimationFrame(render);
  // Uncomment the controls if you want to use OrbitControls
  // controls.update();

  ball.update();
  updateCameraPos(ball.getPhysicsBody());
  shapeBuilder.syncShapes();

  physicsWorld.step(1 / 60);
  // cannonDebugger.update();

  renderer.render(scene, camera);
}

const cameraOffset = new THREE.Vector3(0, 16, 16);

function updateCameraPos(player: CANNON.Body) {
  const targetCameraPosition = new THREE.Vector3();
  targetCameraPosition.copy(player.position).add(cameraOffset);
  camera.position.lerp(targetCameraPosition, 0.5);

  // Vector facing outwards from camera
  const cameraFacingDirection = new THREE.Vector3(0, 0, -1).normalize();

  // Calculate direction vector from camera to target
  const direction = new THREE.Vector3().subVectors(
    player.position,
    camera.position
  );

  const angleRadians = cameraFacingDirection.angleTo(direction);
  const axis = new THREE.Vector3()
    .crossVectors(cameraFacingDirection, direction)
    .normalize();
  const quaternion = new THREE.Quaternion().setFromAxisAngle(
    axis,
    angleRadians
  );
  camera.quaternion.copy(quaternion);
}

await init();

render();
