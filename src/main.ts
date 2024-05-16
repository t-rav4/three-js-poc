import "./style.css";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { TextBuilder } from "./components/TextBuilder";
import { ShapeBuilder } from "./components/ShapeBuilder";
import { ModelService } from "./ModelService";

import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GameCamera } from "./camera";
import { Ball } from "./ball";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const gameCamera = new GameCamera();

const gui = new GUI();

const canvas = document.querySelector("#bg") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const orbitControls = new OrbitControls(
  gameCamera.gCamera,
  renderer.domElement
);
orbitControls.enableDamping = true; // Adds some drag to the camera movement

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
// Cannon Physics Debugger
const cannonDebugger = CannonDebugger(scene, physicsWorld, {
  color: 0xff0000,
});

// Set up camera, renderer, lighting
async function init() {
  gameCamera.gCamera.position.set(0, 16, 16);
  gameCamera.gCamera.lookAt(0, 0, 0);

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

// threejs mesh TransformControls
const transformControl = new TransformControls(
  gameCamera.gCamera,
  renderer.domElement
);
// Temporarily disable orbit controls while manipulating a transform
transformControl.addEventListener("dragging-changed", (event: any) => {
  orbitControls.enabled = !event.value;
});

scene.add(transformControl);

// Model Service
const modelInstance = new ModelService(
  scene,
  physicsWorld,
  shapeBuilder,
  transformControl
);

const models = [
  "models/structure-wood.glb",
  "models/bowl-side.glb",
  "models/car.glb",
  "models/half-pipe.glb",
  "models/obstacle-box.glb",
  "models/obstacle-end.glb",
  "models/obstacle-middle.glb",
  "models/pallet.glb",
  "models/rail-curve.glb",
  "models/rail-high.glb",
  "models/steps.glb",
  "models/structure-platform.glb",
];

const folder = gui.addFolder("Models");
models.forEach((model) => {
  folder.add({ model: () => createModel(model) }, "model").name(model);
});

function createModel(pathToModel: string) {
  modelInstance.addModelToScene(pathToModel, undefined, 10, true);
}

// 3d Floating Text
const textBuilder = new TextBuilder(scene);
textBuilder.createText("JAEGERSOFT", new THREE.Vector3(0, 5, -20));

// Create the Ball instance
const ball = new Ball();
scene.add(ball.getMesh());
physicsWorld.addBody(ball.getPhysicsBody());

// Main Game Loop
function render() {
  requestAnimationFrame(render);
  orbitControls.update();
  ball.update();
  // gameCamera.updateCameraPos(ball.getPhysicsBody());
  shapeBuilder.syncShapes();

  physicsWorld.step(1 / 60);
  cannonDebugger.update();

  renderer.render(scene, gameCamera.gCamera);
}

await init();

render();
