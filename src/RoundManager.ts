import * as THREE from "three";
import { ShapeInstance } from "./components/ShapeBuilder";
import { TextBuilder } from "./components/TextBuilder";
import { EnemyManager } from "./EnemyManager";
import { PickupManager } from "./PickupManager";
import { Player } from "./Player";
import { UIManager } from "./UIManager";

type GameRound = {
  enemies: number;
  coins: number;
};

const gameRounds: GameRound[] = [
  {
    enemies: 3,
    coins: 1,
  },
  {
    enemies: 4,
    coins: 2,
  },
  {
    enemies: 7,
    coins: 3,
  },
  {
    enemies: 10,
    coins: 5,
  },
];

export class RoundManager {
  gameRound!: GameRound;
  currentRoundNumber = 0;

  currentEnemies: ShapeInstance[] = [];

  roundIsOngoing = false;
  roundIsLost = false;

  uiManager: UIManager;
  player: Player;
  enemyManager: EnemyManager;
  pickupManager: PickupManager;
  textBuilder: TextBuilder;

  constructor(
    uiManager: UIManager,
    player: Player,
    enemyManager: EnemyManager,
    pickupManager: PickupManager,
    textBuilder: TextBuilder
  ) {
    this.uiManager = uiManager;
    this.player = player;
    this.enemyManager = enemyManager;
    this.pickupManager = pickupManager;
    this.textBuilder = textBuilder;
  }

  startRound() {
    this.uiManager.hidePopupScreens();
    this.textBuilder.removeText();
    this.gameRound = gameRounds[this.currentRoundNumber];

    this.displayRoundText();

    this.enemyManager.destroyAll();
    this.player.resetPlayer();

    this.enemyManager.spawnEnemies(this.gameRound.enemies);
    this.pickupManager.spawnCoin(this.gameRound.coins);

    setTimeout(() => {
      this.roundIsOngoing = true;
      this.player.enableMovement();
      this.enemyManager.movementEnabled = true;
    }, 3000);
  }

  displayRoundText() {
    this.textBuilder.createText(
      `ROUND ${this.currentRoundNumber + 1}`,
      new THREE.Vector3(0, 5, -20)
    );
    // TODO: race condition here - createText is asynchronous
    setTimeout(() => {
      this.textBuilder.fadeOut(5000);
    }, 5000);
  }

  proceedToNextRound() {
    console.log("doing this");
    // Hide any opened UIs
    this.uiManager.hidePopupScreens();

    if (this.currentRoundNumber == 4) {
      // TODO: handle this
      return;
    }

    this.currentRoundNumber += 1;
    this.startRound();
  }

  update() {
    if (!this.roundIsOngoing) {
      return;
    }

    if (this.player.coins == this.gameRound.coins) {
      console.log("excuse me");
      this.winRound();
    }

    if (this.player.getHealth() <= 0) {
      this.loseRound();
    }
  }

  loseRound() {
    this.player.stopMovement();
    this.enemyManager.stopMovement();
    this.roundIsOngoing = false;
    this.uiManager.showLoseScreen();
    this.uiManager.onNext = () => this.restartGame();
  }

  winRound() {
    this.player.stopMovement();
    this.enemyManager.stopMovement();
    this.roundIsOngoing = false;

    if (this.currentRoundNumber == gameRounds.length) {
      this.uiManager.showWinScreenUI();
    } else {
      console.log("okay showround winui");
      this.uiManager.onNext = () => this.proceedToNextRound();
      this.uiManager.showRoundWinUI();
    }
  }

  restartGame() {
    this.currentRoundNumber = 0;
    this.startRound();
  }
}
