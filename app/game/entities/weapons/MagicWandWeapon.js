import { BaseWeapon } from "./BaseWeapon.js";
export class MagicWandWeapon extends BaseWeapon {
  constructor(scene, player) {
    super(scene, player);

    this.name = "Shamir's Shard";

    // Set weapon stats
    this.stats = {
      damage: 4,
      pierce: 2,
      cooldown: 1200,
      range: 200,
      speed: 200,
      magicPower: 10,
      criticalChance: 0.05,
      elementalDamage: 2,
      scale: 0.4,
    };

    // Effect colors for magic wand
    this.effectColors = {
      primary: 0x00ffff, // Cyan
      secondary: 0xff00ff, // Magenta
      energy: 0xf0f0ff, // Light blue-white
    };

    // Initialize level configuration
    this.currentLevel = 1;
    this.maxLevel = 8;
    this.levelConfigs = {
      1: {
        damage: 8,
        pierce: 2,
        cooldown: 800,
        magicPower: 15,
        criticalChance: 0.08,
        range: 300,
        scale: 0.45,
      },
      2: {
        damage: 12,
        pierce: 3,
        cooldown: 700,
        magicPower: 20,
        criticalChance: 0.1,
        range: 350,
        scale: 0.5,
      },
      3: {
        damage: 16,
        pierce: 3,
        cooldown: 600,
        magicPower: 25,
        criticalChance: 0.12,
        range: 400,
        scale: 0.55,
      },
      4: {
        damage: 20,
        pierce: 4,
        cooldown: 500,
        magicPower: 30,
        criticalChance: 0.15,
        range: 450,
        scale: 0.6,
      },
      5: {
        damage: 25,
        pierce: 4,
        cooldown: 400,
        magicPower: 35,
        criticalChance: 0.17,
        range: 500,
        scale: 0.6,
      },
      6: {
        damage: 30,
        pierce: 5,
        cooldown: 300,
        magicPower: 40,
        criticalChance: 0.2,
        range: 550,
        scale: 0.61,
      },
      7: {
        damage: 35,
        pierce: 5,
        cooldown: 200,
        magicPower: 45,
        criticalChance: 0.22,
        range: 600,
        scale: 0.62,
      },
      8: {
        damage: 45,
        pierce: 6,
        cooldown: 150,
        magicPower: 60,
        criticalChance: 0.3,
        range: 700,
        scale: 0.65,
        speed: 400,
        elementalDamage: 15,
        explosionRadius: 120,
        explosionDamage: 30,
      },
    };

    // Track last movement direction
    this.lastDirection = { x: 1, y: 0 }; // Default right direction

    // Initialize lastFiredTime
    this.lastFiredTime = 0;

    // Calculate max pool sizes
    const maxProjectilesPerLevel = Object.values(this.levelConfigs).map(
      (config) => config.pierce * 2 // Double for safety
    );
    const maxProjectilesNeeded = Math.max(...maxProjectilesPerLevel);

    // Initialize object pools
    this.projectilePool = {
      objects: [],
      maxSize: maxProjectilesNeeded * 3, // Triple for overlapping cooldowns and pierce

      get() {
        return this.objects.find((obj) => !obj.active);
      },

      return(obj) {
        if (!obj) return;
        obj.active = false;
        if (obj.sprite) {
          obj.sprite.setActive(false).setVisible(false);
          obj.sprite.body.setVelocity(0, 0);
        }
        if (obj.sprite.glow) {
          obj.sprite.glow.setActive(false).setVisible(false);
        }
      },
    };

    this.createProjectilePool();
  }

  createProjectilePool() {
    // Clear existing projectiles if any
    if (this.activeProjectiles) {
      this.activeProjectiles.forEach((proj) => {
        if (proj.sprite) {
          if (proj.sprite.glow) {
            proj.sprite.glow.destroy();
          }
          proj.sprite.destroy();
        }
      });
    }

    // Create new pool
    for (let i = 0; i < this.projectilePool.maxSize; i++) {
      const sprite = this.scene.physics.add.sprite(0, 0, "weapon-wand-projectile");
      sprite.setScale(this.stats.scale);
      sprite.setActive(false).setVisible(false);
      sprite.setTint(this.effectColors.primary);

      // Set up physics body
      sprite.body.setSize(30, 30);
      sprite.body.setCircle(15);
      sprite.body.setCollideWorldBounds(false);
      sprite.body.setAllowGravity(false);
      sprite.body.setImmovable(true);

      // Add glow effect
      const glowSprite = this.scene.add.sprite(0, 0, "weapon-wand-projectile");
      glowSprite.setScale(this.stats.scale * 1.4);
      glowSprite.setAlpha(0.3);
      glowSprite.setVisible(false);
      glowSprite.setTint(this.effectColors.secondary);
      glowSprite.setBlendMode(Phaser.BlendModes.ADD);
      sprite.glow = glowSprite;

      this.projectilePool.objects.push({
        sprite,
        active: false,
        angle: 0,
        pierceCount: this.stats.pierce,
        hitEnemies: new Set(),
      });
    }
  }

  deactivateProjectile(proj) {
    if (!proj) return;
    proj.hitEnemies.clear();
    this.projectilePool.return(proj);
  }

  updateProjectile(proj, delta) {
    if (!proj.active || !proj.sprite || !proj.sprite.active) return;

    // Convert delta to seconds for consistent speed
    const deltaSeconds = delta / 1000;

    // Calculate velocity based on angle and speed
    const speed = this.stats.speed;
    const velocityX = Math.cos(proj.angle) * speed;
    const velocityY = Math.sin(proj.angle) * speed;

    // Set velocity directly on physics body
    proj.sprite.setVelocity(velocityX, velocityY);

    // Update glow position
    if (proj.sprite.glow) {
      proj.sprite.glow.x = proj.sprite.x;
      proj.sprite.glow.y = proj.sprite.y;
    }

    // Check if projectile is out of range from player
    const distanceFromPlayer = Math.sqrt(
      Math.pow(proj.sprite.x - this.player.x, 2) + Math.pow(proj.sprite.y - this.player.y, 2)
    );

    if (distanceFromPlayer > this.stats.range) {
      this.deactivateProjectile(proj);
      return;
    }

    // Get the camera viewport bounds
    const camera = this.scene.cameras.main;
    const margin = 100;

    const bounds = {
      left: camera.scrollX - margin,
      right: camera.scrollX + camera.width + margin,
      top: camera.scrollY - margin,
      bottom: camera.scrollY + camera.height + margin,
    };

    // Check if projectile is outside camera view
    if (
      proj.sprite.x < bounds.left ||
      proj.sprite.x > bounds.right ||
      proj.sprite.y < bounds.top ||
      proj.sprite.y > bounds.bottom
    ) {
      this.deactivateProjectile(proj);
    }
  }

  update(time, delta) {
    // Call base class update which includes death check
    if (!super.update(time, delta)) {
      return;
    }

    if (!this.player) return;

    // Update last movement direction if player is moving
    if (this.player.body && (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0)) {
      const velocity = this.player.body.velocity;
      const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      if (magnitude > 0) {
        this.lastDirection = {
          x: velocity.x / magnitude,
          y: velocity.y / magnitude,
        };
      }
    }

    // Check if it's time to fire
    if (time - this.lastFiredTime >= this.stats.cooldown) {
      // Find an inactive projectile
      const availableProj = this.projectilePool.get();

      if (availableProj) {
        // Reset the projectile state before firing
        availableProj.active = false;
        availableProj.pierceCount = this.stats.pierce;
        this.fireProjectile(availableProj, time);
      }
    }

    // Update active projectiles
    this.projectilePool.objects.forEach((proj) => {
      if (proj.active) {
        this.updateProjectile(proj, delta);

        // Check for collisions with enemies
        if (this.scene.enemies && proj.pierceCount > 0) {
          this.scene.enemies.forEach((enemy) => {
            if (enemy && enemy.sprite && enemy.sprite.active && !enemy.isDead && !proj.hitEnemies.has(enemy)) {
              const bounds1 = proj.sprite.getBounds();
              const bounds2 = enemy.sprite.getBounds();

              if (Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2)) {
                this.handleHit(enemy, proj);
                proj.hitEnemies.add(enemy);
              }
            }
          });
        }
      }
    });
  }

  handleHit(enemy, proj) {
    if (!enemy || !enemy.sprite || !enemy.sprite.active || enemy.isDead) {
      return;
    }

    // Calculate damage
    let finalDamage = this.stats.damage;
    let isCritical = false;

    if (Math.random() < this.stats.criticalChance) {
      finalDamage *= 2;
      isCritical = true;
    }

    // Add elemental damage
    finalDamage += this.stats.elementalDamage;

    // Apply magic power bonus
    finalDamage *= 1 + this.stats.magicPower / 100;

    const roundedDamage = Math.round(finalDamage);
    enemy.takeDamage(roundedDamage, proj.sprite.x, proj.sprite.y);

    // Create hit effect
    this.createHitEffect(enemy, proj, isCritical);

    // Create arcane explosion at max level
    if (this.currentLevel === this.maxLevel) {
      this.createArcaneExplosion(proj.sprite.x, proj.sprite.y);
    }

    // Reduce pierce count and handle projectile state
    proj.pierceCount--;

    if (proj.pierceCount <= 0) {
      this.deactivateProjectile(proj);
    }
  }

  createArcaneExplosion(x, y) {
    // Create main burst with smaller, more refined scale
    const burst = this.scene.add.sprite(x, y, "weapon-wand-projectile");
    burst.setScale(0.4); // Reduced from 0.8
    burst.setTint(this.effectColors.primary);
    burst.setBlendMode(Phaser.BlendModes.ADD);

    // More subtle expanding ring effect
    this.scene.tweens.add({
      targets: burst,
      scaleX: 1.5, // Reduced from 3
      scaleY: 1.5, // Reduced from 3
      alpha: { from: 0.7, to: 0 }, // Slightly more transparent
      duration: 400, // Faster fade
      ease: "Quad.out",
      onComplete: () => burst.destroy(),
    });

    // Fewer, more subtle magical runes
    const runeCount = 5; // Reduced from 8
    for (let i = 0; i < runeCount; i++) {
      const angle = (i / runeCount) * Math.PI * 2;
      const distance = 25; // Reduced from 40
      const rune = this.scene.add.sprite(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        "weapon-wand-projectile"
      );

      rune.setScale(0.25); // Reduced from 0.4
      rune.setTint(this.effectColors.secondary);
      rune.setBlendMode(Phaser.BlendModes.ADD);
      rune.setAlpha(0.6); // More transparent
      rune.rotation = angle;

      this.scene.tweens.add({
        targets: rune,
        scaleX: 0.4, // Reduced scale increase
        scaleY: 0.4,
        alpha: 0,
        rotation: angle + Math.PI, // Half rotation for subtlety
        duration: 400, // Faster animation
        ease: "Sine.out",
        onComplete: () => rune.destroy(),
      });
    }

    // More refined energy particles
    const particles = this.scene.add.particles(x, y, "weapon-wand-projectile", {
      scale: { start: 0.2, end: 0.05 }, // Smaller particles
      speed: { min: 50, max: 100 }, // Slower, more controlled speed
      angle: { min: 0, max: 360 },
      alpha: { start: 0.6, end: 0 },
      tint: this.effectColors.energy,
      blendMode: Phaser.BlendModes.ADD,
      lifespan: 500, // Shorter lifespan
      quantity: 8, // Fewer particles
    });

    this.scene.time.delayedCall(500, () => particles.destroy());

    // Smaller damage zone
    const radius = this.stats.explosionRadius * 0.8; // 20% smaller radius
    const nearbyEnemies = this.scene.enemies.filter(
      (enemy) =>
        enemy &&
        enemy.sprite &&
        enemy.sprite.active &&
        !enemy.isDead &&
        Phaser.Math.Distance.Between(x, y, enemy.sprite.x, enemy.sprite.y) <= radius
    );

    // More subtle energy connections
    nearbyEnemies.forEach((enemy) => {
      const arcaneDamage = this.stats.explosionDamage;
      enemy.takeDamage(arcaneDamage, x, y);

      // Thinner, more elegant energy lines
      const line = this.scene.add.line(0, 0, x, y, enemy.sprite.x, enemy.sprite.y, this.effectColors.primary);
      line.setLineWidth(1.5); // Thinner lines
      line.setAlpha(0.5); // More transparent
      line.setBlendMode(Phaser.BlendModes.ADD);

      this.scene.tweens.add({
        targets: line,
        alpha: 0,
        duration: 200, // Faster fade
        ease: "Linear",
        onComplete: () => line.destroy(),
      });
    });
  }

  fireProjectile(proj, time) {
    // Remove the active check since we just got an inactive projectile
    if (!proj.sprite) return;

    // Reset projectile state
    proj.pierceCount = this.stats.pierce;
    proj.hitEnemies.clear();
    proj.active = true;

    // Get target position
    const target = this.getTargetPosition();
    if (!target) return;

    // Calculate angle to target
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    proj.angle = Math.atan2(dy, dx);

    // Set initial position and rotation
    proj.sprite.setPosition(this.player.x, this.player.y);
    proj.sprite.setRotation(proj.angle);
    proj.sprite.setActive(true).setVisible(true); // Activate and show the sprite

    if (proj.sprite.glow) {
      proj.sprite.glow.setPosition(this.player.x, this.player.y);
      proj.sprite.glow.rotation = proj.angle;
      proj.sprite.glow.setActive(true).setVisible(true); // Activate and show the glow
    }

    this.lastFiredTime = time;
  }

  getTargetPosition() {
    // Ensure we have valid enemies array
    if (!Array.isArray(this.scene.enemies)) {
      return this.getDefaultTarget();
    }

    // Filter valid and reachable enemies
    const validEnemies = this.scene.enemies.filter((enemy) => {
      if (!enemy || !enemy.sprite || !enemy.sprite.active || enemy.isDead) {
        return false;
      }

      // Check if enemy is within range
      const dist = this.getDistance(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);

      // Add a small buffer to range for better targeting
      return dist <= this.stats.range * 1.2;
    });

    if (validEnemies.length > 0) {
      // Find the best target based on distance and angle
      let bestTarget = null;
      let bestScore = Number.MAX_VALUE;

      validEnemies.forEach((enemy) => {
        const dist = this.getDistance(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);

        // Calculate angle difference from current direction
        const angle = Math.atan2(enemy.sprite.y - this.player.y, enemy.sprite.x - this.player.x);
        const currentAngle = Math.atan2(this.lastDirection.y, this.lastDirection.x);
        let angleDiff = Math.abs(angle - currentAngle);
        if (angleDiff > Math.PI) {
          angleDiff = 2 * Math.PI - angleDiff;
        }

        // Score based on distance and angle (lower is better)
        // Prioritize enemies in front of the player
        const score = dist + angleDiff * 100;

        if (score < bestScore) {
          bestTarget = enemy;
          bestScore = score;
        }
      });

      if (bestTarget) {
        return {
          x: bestTarget.sprite.x,
          y: bestTarget.sprite.y,
        };
      }
    }

    return this.getDefaultTarget();
  }

  getDefaultTarget() {
    // Use last movement direction if no valid enemies
    const targetDistance = Math.min(100, this.stats.range * 0.5); // Don't shoot too far when no enemies
    return {
      x: this.player.x + this.lastDirection.x * targetDistance,
      y: this.player.y + this.lastDirection.y * targetDistance,
    };
  }

  getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  levelUp() {
    if (this.currentLevel >= this.maxLevel) {
      console.log("Weapon already at max level!");
      return false;
    }

    this.currentLevel++;
    const newStats = this.levelConfigs[this.currentLevel];

    // Update stats
    this.stats = {
      ...this.stats,
      ...newStats,
    };

    console.log(`Magic Wand leveled up to ${this.currentLevel}! New stats:`, this.stats);

    // Create level up effect around the player
    const burst = this.scene.add.sprite(this.player.x, this.player.y, "weapon-magic-wand");
    burst.setScale(0.2);
    burst.setAlpha(0.7);
    burst.setTint(0x00ffff);

    this.scene.tweens.add({
      targets: burst,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      ease: "Quad.easeOut",
      onComplete: () => burst.destroy(),
    });

    // Recreate projectile pool with new stats
    this.createProjectilePool();

    return true;
  }

  createHitEffect(enemy, proj, isCritical) {
    // Simplified hit effect without glow
    const hitEffect = this.scene.add.sprite(enemy.sprite.x, enemy.sprite.y, "weapon-wand-icon");
    hitEffect.setScale(0.3);
    hitEffect.setAlpha(0.6);

    this.scene.tweens.add({
      targets: hitEffect,
      scaleX: 0.8,
      scaleY: 0.8,
      alpha: 0,
      duration: 150,
      ease: "Quad.easeOut",
      onComplete: () => hitEffect.destroy(),
    });

    // Simplified critical hit particles without glow
    if (isCritical) {
      const particles = this.scene.add.particles(enemy.sprite.x, enemy.sprite.y, "weapon-wand-icon", {
        scale: { start: 0.1, end: 0.05 },
        alpha: { start: 0.4, end: 0 },
        speed: 40,
        angle: { min: 0, max: 360 },
        lifespan: 300,
        quantity: 6,
      });

      this.scene.time.delayedCall(300, () => particles.destroy());
    }
  }

  attack(time) {
    // Find an inactive projectile or one that's ready to be recycled
    const availableProj = this.projectilePool.get();

    if (availableProj) {
      // Reset the projectile state before firing
      availableProj.active = false;
      availableProj.pierceCount = this.stats.pierce;
      this.fireProjectile(availableProj, time);
    }

    // Call super to update lastFiredTime
    super.attack(time);
  }
}

export default MagicWandWeapon;
