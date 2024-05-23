import { TextBuilder } from "./components/TextBuilder";
import { Obstacles } from "./Obstacles";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { ShapeBuilder } from "./components/ShapeBuilder";
import { Ball } from "./ball";
import { GameCamera } from "./GameCamera";

export class Game {
  roundNumber!: number;

  textBuilder: TextBuilder;
  shapeBuilder: ShapeBuilder;
  obstacles: Obstacles;
  gameCamera: GameCamera;

  player: Ball;

  constructor(scene: THREE.Scene, world: CANNON.World, gameCamera: GameCamera) {
    this.textBuilder = new TextBuilder(scene);
    this.shapeBuilder = new ShapeBuilder(scene, world);
    this.obstacles = new Obstacles(this.shapeBuilder);
    this.gameCamera = gameCamera;

    this.player = new Ball();
    scene.add(this.player.getMesh());
    world.addBody(this.player.getPhysicsBody());

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
  }

  update() {
    // Round completion etc..

    this.player.update();
    this.gameCamera.updateCameraPos(this.player.getPhysicsBody());

    this.obstacles.moveObstacles(this.player.getPhysicsBody().position);
    this.shapeBuilder.syncPhysics();
  }

  // TODO: spawn powerups around map - conditions depend on round number?
  // spawnPowerup() {}

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
}
