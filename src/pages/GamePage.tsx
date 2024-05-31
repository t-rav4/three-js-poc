// from game.ts
import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GameCamera } from "../features/Camera/GameCamera";
import { ModelService } from "../features/Model/ModelService";
import { ShapeBuilder } from "../features/Model/ShapeBuilder";
import { Game } from "../Game";

// React stuff
import React, { useEffect, useRef, useState } from "react";
import "./gamestyle.css";

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

export default function GamePage() {
  const [hideMenu, setHideMenu] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // TODO: determine which of these will be needed
  // const sceneRef = useRef<THREE.Scene | null>(null);
  // const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  // const physicsWorldRef = useRef<CANNON.World | null>(null);
  // const gameCameraRef = useRef<GameCamera | null>(null);
  // const guiRef = useRef<GUI | null>(null);
  // const shapeBuilderRef = useRef<ShapeBuilder | null>(null);
  // const transformControlRef = useRef<TransformControls | null>(null);
  // const modelServiceRef = useRef<ModelService | null>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvasRef.current.style.display = "none";
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const gui = new GUI();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const gameCamera = new GameCamera(renderer);
    const physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -30, 0),
    });

    physicsWorld.defaultContactMaterial = new CANNON.ContactMaterial(
      new CANNON.Material({ friction: 1.0 }),
      new CANNON.Material({ friction: 1.0 }),
      { friction: 1.0, restitution: 0 }
    );

    const cannonDebugger = CannonDebugger(scene, physicsWorld, {
      color: 0xff0000,
    });

    gameCamera.gCamera.position.set(0, 16, 16);
    gameCamera.gCamera.lookAt(0, 0, 0);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);

    setupLighting(scene, gui);
    createPlane(scene, physicsWorld);
    document.body.appendChild(renderer.domElement);

    const shapeBuilder = new ShapeBuilder(scene, physicsWorld);
    const transformControl = new TransformControls(
      gameCamera.gCamera,
      renderer.domElement
    );

    transformControl.addEventListener("dragging-changed", (event: any) => {
      gameCamera.orbitControls.enabled = !event.value;
    });

    scene.add(transformControl);

    const modelService = new ModelService(
      gameCamera.gCamera,
      scene,
      physicsWorld,
      shapeBuilder,
      transformControl
    );
    const folder = gui.addFolder("Models");
    models.forEach((model) => {
      folder.add({ model: () => createModel(model) }, "model").name(model);
    });

    function createModel(pathToModel: string) {
      modelService.addModelToScene(pathToModel, undefined, 10, true);
    }

    gui.show(false);
    const game = new Game(scene, physicsWorld, gameCamera, shapeBuilder, gui);
    gameRef.current = game;

    function render() {
      requestAnimationFrame(render);
      game.update();
      physicsWorld.step(1 / 60);
      shapeBuilder.removeQueuedInstances();
      renderer.render(scene, gameCamera.gCamera);
    }

    render();

    function handleResize() {
      gameCamera.gCamera.aspect = window.innerWidth / window.innerHeight;
      gameCamera.gCamera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      gui.destroy();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function setupLighting(scene: THREE.Scene, gui: GUI) {
    const folder = gui.addFolder("Ambient light");
    const ambLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambLight);

    folder.add(ambLight, "intensity", 0, 5, 0.1).name("intensity");
  }

  function createPlane(scene: THREE.Scene, world: CANNON.World) {
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
    world.addBody(groundBody);

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

  document.addEventListener("keypress", (event) => {
    // TODO: identified issue - can't disable once enabled
    // if (event.code == "Backquote") {
    //   debuggingEnabled = !debuggingEnabled;
    // }
  });

  function startGame() {
    if (canvasRef.current && gameRef.current) {
      setHideMenu(true);
      canvasRef.current.style.display = "block";
      gameRef.current.startGame();
    }
  }
  return (
    <>
      {!hideMenu && (
        <div id="start-menu" className="abs-centered">
          <div id="start-button" className="button" onClick={startGame}>
            START GAME
          </div>
        </div>
      )}
      <div id="player-ui">
        <p>
          Health: <span id="player-health" />
        </p>
        <p>
          Coins: <span id="player-coin-count"></span> /{" "}
          <span id="round-coin-count" />
        </p>
      </div>
      <div className="popup-ui abs-centered">
        <div id="pause-menu-ui">
          <h2>PAUSED</h2>
        </div>
        <div id="round-loss-ui" className="popup-layout">
          <h2>ROUND LOST</h2>
          <div className="button">Respawn</div>
        </div>
        <div id="round-win-ui" className="popup-layout">
          <h2>ROUND WIN</h2>
          <div className="button">NEXT ROUND</div>
        </div>
        <div id="win-screen-ui">YOU WIN</div>
      </div>
      <canvas id="bg" ref={canvasRef}></canvas>
    </>
  );
}
