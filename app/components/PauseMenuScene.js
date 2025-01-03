"use client";

const PauseMenuScene = Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function PauseMenuScene() {
    Phaser.Scene.call(this, { key: "PauseMenuScene" });
  },

  preload: function () {
    this.load.svg("ss-logo", "/ss-logo.svg", {
      scale: 1.5,
    });
  },

  create: function () {
    // Semi-transparent black background
    this.overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    this.overlay.setOrigin(0);

    // Create retro-styled text
    const textConfig = {
      fontFamily: "VT323",
      fontSize: "32px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      shadow: { color: "#000000", blur: 10, stroke: true, fill: true },
    };

    // PAUSED text with scanline effect
    const pausedText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, "PAUSED", {
      ...textConfig,
      fontSize: "48px",
    });
    pausedText.setOrigin(0.5);

    // Reminder to blink text
    const blinkText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Reminder to blink", {
      ...textConfig,
      fontSize: "24px",
      color: "#8f8f8f",
    });
    blinkText.setOrigin(0.5);

    // Instructions
    const instructionText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 50,
      "Press P to Resume",
      textConfig
    );
    instructionText.setOrigin(0.5);

    // Add SS logo
    const logo = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 120, "ss-logo");
    logo.setScale(0.15); // Adjust scale as needed
    logo.setOrigin(0.5);

    // Add a subtle floating animation to the logo
    this.tweens.add({
      targets: logo,
      y: "+=5",
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add scanline effect
    this.scanlines = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.1);
    this.scanlines.setOrigin(0);
    this.scanlines.setBlendMode(Phaser.BlendModes.MULTIPLY);

    // Scanline animation
    this.tweens.add({
      targets: this.scanlines,
      alpha: 0.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Glowing effect for PAUSED text
    this.tweens.add({
      targets: pausedText,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Handle P key press
    this.input.keyboard.on("keydown-P", () => {
      const gameScene = this.scene.get("GameScene");
      if (gameScene.gameState.pauseStartTime) {
        const pauseDuration = Date.now() - gameScene.gameState.pauseStartTime;
        gameScene.gameState.totalPauseTime = (gameScene.gameState.totalPauseTime || 0) + pauseDuration;
        gameScene.gameState.pauseStartTime = null;
      }
      gameScene.gameState.isPaused = false;
      this.scene.resume("GameScene");
      this.scene.stop();
    });
  },
});

export default PauseMenuScene;
