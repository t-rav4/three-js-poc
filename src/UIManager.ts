export class UIManager {
  startMenuUI: HTMLElement;
  playerUI: HTMLElement;
  popupUI: HTMLElement;

  roundLossUI: HTMLElement | null;
  roundWinUI: HTMLElement | null;
  winScreenUI: HTMLElement | null;
  pauseMenuUI: HTMLElement | null;

  playerHealthUI: HTMLElement | null;
  playerCoinCount: HTMLElement | null;
  roundCoinCount: HTMLElement | null;

  onNext: (() => void) | undefined; // a means of assigning a callback for ui button onclicks

  constructor() {
    this.startMenuUI = document.querySelector("#start-menu") as HTMLElement;
    this.playerUI = document.querySelector("#player-ui") as HTMLElement;
    this.popupUI = document.getElementsByClassName(
      "popup-ui"
    )[0] as HTMLElement;

    this.roundLossUI = document.getElementById("round-loss-ui");
    this.roundWinUI = document.getElementById("round-win-ui");
    this.winScreenUI = document.getElementById("win-screen-ui");
    this.pauseMenuUI = document.getElementById("pause-menu-ui");

    this.playerHealthUI = document.getElementById("player-health");
    this.playerCoinCount = document.getElementById("player-coin-count");
    this.roundCoinCount = document.getElementById("round-coin-count");
  }

  showRoundWinUI() {
    this.popupUI.style.display = "block";

    if (this.roundWinUI) {
      this.roundWinUI.style.display = "block";

      const nextButton = this.roundWinUI.querySelector(
        ".button"
      ) as HTMLElement;
      nextButton.onclick = () => this.onNext?.();
    }
  }

  showLoseScreen() {
    this.popupUI.style.display = "block";

    if (this.roundLossUI) {
      this.roundLossUI.style.display = "flex";
      const nextButton = this.roundLossUI.querySelector(
        ".button"
      ) as HTMLElement;
      nextButton.onclick = () => this.onNext?.();
    }
  }

  showWinScreenUI() {
    this.popupUI.style.display = "block";
    if (this.roundWinUI) {
      this.roundWinUI.style.display = "flex";
    }
  }

  showPauseMenu() {
    this.popupUI.style.display = "block";
    if (this.pauseMenuUI) {
      this.pauseMenuUI.style.display = "flex";
    }
  }

  hidePopupScreens() {
    this.popupUI!.style.display = "none";
    this.roundLossUI!.style.display = "none";
    this.roundWinUI!.style.display = "none";
    this.winScreenUI!.style.display = "none";
  }

  updatePlayerHUD(
    playerHealth: number,
    playerCoinCount: number,
    roundCoins: number
  ) {
    if (this.playerHealthUI && this.playerCoinCount && this.roundCoinCount) {
      this.playerHealthUI.innerText = playerHealth.toString();
      this.playerCoinCount.innerText = playerCoinCount.toString();
      this.roundCoinCount.innerText = roundCoins.toString();
    }
  }

  showGameUI() {
    // Hide start menu
    this.startMenuUI.style.display = "none";
    // Show player HUD
    this.playerUI.style.display = "flex";
  }
}
