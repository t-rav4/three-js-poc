import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { StarBuilder } from "./components/StarBuilder";
import { TextBuilder } from "./components/TextBuilder";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const canvas = document.querySelector("#bg") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const gui = new GUI();
const textBuilder = new TextBuilder(scene);
const starBuilder = new StarBuilder(scene);

function init() {
  camera.position.set(-10, 16, 20);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  const gridHelper = new THREE.GridHelper(200, 50);
  scene.add(gridHelper);

  textBuilder.createText("JAEGERSOFT");

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
  const planeSize = 40;

  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    "https://threejs.org/manual/examples/resources/images/checker.png"
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -0.5;
  scene.add(mesh);
}

function render() {
  controls.update();
  starBuilder.animateStars();

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

init();

render();
