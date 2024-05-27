import { TextBuilder } from "./components/TextBuilder";
import { EnemyManager } from "./EnemyManager";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { ShapeBuilder } from "./components/ShapeBuilder";
import { Player } from "./Player";
import { GameCamera } from "./GameCamera";
import { RoundManager } from "./RoundManager";
import { UIManager } from "./UIManager";
import { PickupManager } from "./PickupManager";

export class Game {
  isPaused = false;

  textBuilder: TextBuilder;
  shapeBuilder: ShapeBuilder;
  enemyManager: EnemyManager;
  pickupManager: PickupManager;
  gameCamera: GameCamera;
  roundManager: RoundManager;

  scene: THREE.Scene;
  world: CANNON.World;
  player: Player;

  uiManager: UIManager;

  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    gameCamera: GameCamera,
    shapeBuilder: ShapeBuilder
  ) {
    this.textBuilder = new TextBuilder(scene);
    this.shapeBuilder = shapeBuilder;
    this.enemyManager = new EnemyManager(this.shapeBuilder);
    this.pickupManager = new PickupManager(this.shapeBuilder);
    this.gameCamera = gameCamera;

    this.uiManager = new UIManager();

    this.player = new Player();
    scene.add(this.player.getMesh());
    world.addBody(this.player.getPhysicsBody());

    this.roundManager = new RoundManager(
      this.uiManager,
      this.player,
      this.enemyManager,
      this.pickupManager,
      this.textBuilder
    );

    this.scene = scene;
    this.world = world;
    this.bindInputs();
    this.init();
  }

  init() {
    this.roundManager.startRound();
  }

  update() {
    this.updateHUD();

    this.roundManager.update();

    this.player.update();
    this.enemyManager.moveEnemies(this.player.getPhysicsBody().position);

    this.gameCamera.updateCameraPos(this.player.getPhysicsBody());

    this.shapeBuilder.syncPhysics();
  }

  bindInputs() {
    document.addEventListener("keypress", (event) => {
      // if (event.code == "KeyP") {
      //   this.pauseGame();
      // }

      if (event.code == "KeyV") {
        this.gameCamera.toggleCameraMode();
      }

      if (event.code == "Digit1") {
        this.enemyManager.toggle();
      }
    });
  }

  updateHUD() {
    console.log();
    this.uiManager.updatePlayerHUD(
      this.player.health,
      this.player.coins,
      this.roundManager.gameRound.coins
    );
  }

  // pauseGame() {
  //   // TODO: prevent pausing whilst other round related UI is being displayed!
  //   if (!this.roundManager.roundIsOngoing) {
  //     return;
  //   }

  //   this.isPaused = !this.isPaused;
  //   if (this.isPaused) {
  //     this.uiManager.showPauseMenu();
  //   }
  // }
}
