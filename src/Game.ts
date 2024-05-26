import { TextBuilder } from "./components/TextBuilder";
import { Obstacles } from "./Obstacles";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { ShapeBuilder } from "./components/ShapeBuilder";
import { Player } from "./Player";
import { GameCamera } from "./GameCamera";
import { Pickup } from "./Pickup";
import { getRandomVector3 } from "./utils/vectorUtils";

export class Game {
  roundNumber!: number;

  textBuilder: TextBuilder;
  shapeBuilder: ShapeBuilder;
  obstacles: Obstacles;
  gameCamera: GameCamera;

  scene: THREE.Scene;
  world: CANNON.World;
  player: Player;

  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    gameCamera: GameCamera,
    shapeBuilder: ShapeBuilder
  ) {
    this.textBuilder = new TextBuilder(scene);
    this.shapeBuilder = shapeBuilder;
    this.obstacles = new Obstacles(this.shapeBuilder);
    this.gameCamera = gameCamera;

    this.player = new Player();
    scene.add(this.player.getMesh());
    world.addBody(this.player.getPhysicsBody());

    this.scene = scene;
    this.world = world;
    this.bindInputs();
    this.init();
  }

  init() {
    this.roundNumber = 1;

    this.textBuilder.createText(
      `ROUND ${this.roundNumber}`,
      new THREE.Vector3(0, 5, -20)
    );

    this.obstacles.spawnEnemies(this.roundNumber);

    this.spawnPickups();
  }

  update() {
    // Round completion etc..
    this.updateUI();

    this.player.update();
    this.gameCamera.updateCameraPos(this.player.getPhysicsBody());

    this.obstacles.moveObstacles(this.player.getPhysicsBody().position);
    this.shapeBuilder.syncPhysics();
  }

  // TODO: spawn powerups around map - conditions depend on round number?
  // spawnPowerup() {}

  spawnPickups() {
    for (let i = 0; i < this.roundNumber + 3; i++) {
      const pickup = new Pickup(this.shapeBuilder);
      pickup.setPosition(getRandomVector3(50));
    }
  }

  bindInputs() {
    document.addEventListener("keypress", (event) => {
      if (event.code == "KeyV") {
        this.gameCamera.toggleCameraMode();
      }

      if (event.code == "Digit1") {
        this.obstacles.toggle();
      }
    });
  }

  updateUI() {
    const element = document.getElementById("player-health");
    const coinUI = document.getElementById("coin-count");

    if (element) {
      element.innerText = this.player.getHealth().toString();
    }
    if (coinUI) {
      coinUI.innerText = this.player.getCoins().toString();
    }
  }
}
