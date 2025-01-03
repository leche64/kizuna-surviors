import BaseWeapon from "./BaseWeapon";

export default class ShapecraftKeyWeapon extends BaseWeapon {
  constructor(scene, player) {
    super(scene, player);

    this.name = "Shapebinder";
    this.description = "Conjures geometric shapes with neon trails that seek out enemies";

    // Effect colors for each shape type
    this.shapeColors = {
      triangle: {
        primary: 0x00ffff, // Cyan
        secondary: 0x0088ff, // Light blue
        trail: 0x00ffff, // Cyan trail
        energy: 0xaaffff, // Light cyan energy
      },
      square: {
        primary: 0xff00ff, // Magenta
        secondary: 0xff0088, // Pink
        trail: 0xff00ff, // Magenta trail
        energy: 0xffaaff, // Light magenta energy
      },
      pentagon: {
        primary: 0xffff00, // Yellow
        secondary: 0xff8800, // Orange
        trail: 0xffff00, // Yellow trail
        energy: 0xffffaa, // Light yellow energy
      },
      hexagon: {
        primary: 0x00ff00, // Green
        secondary: 0x88ff00, // Lime
        trail: 0x00ff00, // Green trail
        energy: 0xaaffaa, // Light green energy
      },
      octagon: {
        primary: 0xff0000, // Red
        secondary: 0xff0088, // Pink-red
        trail: 0xff0000, // Red trail
        energy: 0xffaaaa, // Light red energy
      },
    };

    // Max level effects
    this.maxLevelColors = {
      primary: 0xffffff, // Pure white
      secondary: 0xf0f0ff, // Light blue-white
      trail: 0xffffff, // White trail
      energy: 0xffffff, // White energy
    };

    // Level-up configurations
    this.levelConfigs = {
      1: {
        damage: 4,
        pierce: 2,
        cooldown: 1200,
        range: 350,
        speed: 250,
        scale: 0.4,
        projectileCount: 2,
        shapeTypes: ["triangle"],
        trailAlpha: 0.6,
        trailScale: 0.95,
        trailSpacing: 0.05,
        trailLength: 6,
        rotationSpeed: 3,
        seekingSpeed: 180,
        glowIntensity: 0.8,
      },
      2: {
        damage: 5,
        pierce: 2,
        cooldown: 1100,
        range: 375,
        speed: 260,
        scale: 0.45,
        projectileCount: 2,
        shapeTypes: ["triangle", "square"],
        trailAlpha: 0.65,
        trailScale: 0.95,
        trailSpacing: 0.05,
        trailLength: 7,
        rotationSpeed: 3.2,
        seekingSpeed: 190,
        glowIntensity: 0.85,
      },
      3: {
        damage: 7,
        pierce: 3,
        cooldown: 1000,
        range: 400,
        speed: 270,
        scale: 0.5,
        projectileCount: 3,
        shapeTypes: ["triangle", "square", "pentagon"],
        trailAlpha: 0.7,
        trailScale: 0.95,
        trailSpacing: 0.05,
        trailLength: 8,
        rotationSpeed: 3.4,
        seekingSpeed: 200,
        glowIntensity: 0.9,
      },
      4: {
        damage: 9,
        pierce: 3,
        cooldown: 900,
        range: 425,
        speed: 280,
        scale: 0.55,
        projectileCount: 3,
        shapeTypes: ["triangle", "square", "pentagon", "hexagon"],
        trailAlpha: 0.75,
        trailScale: 0.95,
        trailSpacing: 0.045,
        trailLength: 9,
        rotationSpeed: 3.6,
        seekingSpeed: 210,
        glowIntensity: 0.95,
      },
      5: {
        damage: 12,
        pierce: 4,
        cooldown: 800,
        range: 450,
        speed: 290,
        scale: 0.6,
        projectileCount: 4,
        shapeTypes: ["triangle", "square", "pentagon", "hexagon", "octagon"],
        trailAlpha: 0.8,
        trailScale: 0.95,
        trailSpacing: 0.04,
        trailLength: 10,
        rotationSpeed: 3.8,
        seekingSpeed: 220,
        glowIntensity: 1.0,
      },
      6: {
        damage: 14,
        pierce: 4,
        cooldown: 700,
        range: 475,
        speed: 300,
        scale: 0.65,
        projectileCount: 4,
        shapeTypes: ["triangle", "square", "pentagon", "hexagon", "octagon"],
        trailAlpha: 0.85,
        trailScale: 0.96,
        trailSpacing: 0.035,
        trailLength: 11,
        rotationSpeed: 4.0,
        seekingSpeed: 230,
        glowIntensity: 1.1,
      },
      7: {
        damage: 18,
        pierce: 5,
        cooldown: 600,
        range: 500,
        speed: 310,
        scale: 0.7,
        projectileCount: 5,
        shapeTypes: ["triangle", "square", "pentagon", "hexagon", "octagon"],
        trailAlpha: 0.9,
        trailScale: 0.96,
        trailSpacing: 0.03,
        trailLength: 12,
        rotationSpeed: 4.2,
        seekingSpeed: 240,
      },
      8: {
        damage: 35,
        pierce: 6,
        cooldown: 450,
        range: 550,
        speed: 340,
        scale: 0.85,
        projectileCount: 5,
        shapeTypes: ["triangle", "square"],
        trailAlpha: 1.0,
        trailScale: 0.98,
        trailSpacing: 0.06,
        trailLength: 8,
        rotationSpeed: 5.0,
        seekingSpeed: 280,
        glowIntensity: 1.5,
        isMaxLevel: true,
        geometricConvergence: true,
        convergenceBurstCount: 4,
        convergenceDamage: 40,
        convergenceRange: 250,
        convergenceSpeed: 500,
        convergenceScale: 0.7,
        convergenceLifetime: 400,
        rainbowTrail: true,
      },
    };

    // Initialize at level 1
    this.currentLevel = 1;
    this.maxLevel = 8;
    this.stats = { ...this.levelConfigs[this.currentLevel] };

    this.maxProjectiles = 10;
    this.activeProjectiles = [];
    this.lastFiredTime = 0;

    // Create trail pools for each projectile
    this.trailPools = [];
    this.createProjectiles();
  }

  createProjectiles() {
    const texturesToRemove = new Set();

    // Collect textures to remove
    this.activeProjectiles.forEach((proj) => {
      if (proj.sprite && proj.sprite.texture) {
        texturesToRemove.add(proj.sprite.texture.key);
      }
    });

    this.trailPools.forEach((pool) => {
      pool.forEach((sprite) => {
        if (sprite && sprite.texture) {
          texturesToRemove.add(sprite.texture.key);
        }
      });
    });

    // Batch remove textures
    texturesToRemove.forEach((key) => {
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }
    });

    // Clear arrays
    this.activeProjectiles = [];
    this.trailPools = [];

    // Create projectiles in batches
    const batchSize = 2;
    const createBatch = (startIndex) => {
      for (let i = startIndex; i < Math.min(startIndex + batchSize, this.maxProjectiles); i++) {
        const shapeType = this.stats.shapeTypes[i % this.stats.shapeTypes.length];
        const sprite = this.createShapeSprite(shapeType);

        this.activeProjectiles.push({
          sprite: sprite,
          active: false,
          pierceCount: this.stats.pierce,
          trailPositions: [],
          lastTrailTime: 0,
          rotation: 0,
          targetEnemy: null,
          state: "seeking",
        });

        // Create trail pool for this projectile
        const trailPool = [];
        for (let j = 0; j < this.stats.trailLength; j++) {
          const trailSprite = this.createShapeSprite(shapeType);
          trailSprite.setActive(false).setVisible(false);
          trailPool.push(trailSprite);
        }
        this.trailPools.push(trailPool);
      }

      // Schedule next batch if needed
      if (startIndex + batchSize < this.maxProjectiles) {
        this.scene.time.delayedCall(16, () => createBatch(startIndex + batchSize));
      }
    };

    // Start creating batches
    createBatch(0);
  }

  createShapeSprite(shapeType) {
    const graphics = this.scene.add.graphics();
    const size = 30; // Base size for shapes

    // Draw the shape
    graphics.lineStyle(2, this.shapeColors[shapeType].primary);
    graphics.fillStyle(this.shapeColors[shapeType].energy, 0.5);

    switch (shapeType) {
      case "triangle":
        this.drawTriangle(graphics, size);
        break;
      case "square":
        this.drawSquare(graphics, size);
        break;
      case "pentagon":
        this.drawPentagon(graphics, size);
        break;
      case "hexagon":
        this.drawHexagon(graphics, size);
        break;
      case "octagon":
        this.drawOctagon(graphics, size);
        break;
    }

    // Generate unique key for this shape
    const textureKey = `${shapeType}_${Date.now()}_${Math.random()}`;

    // Convert to sprite
    const texture = graphics.generateTexture(textureKey, size * 2, size * 2);
    graphics.destroy();

    // Create sprite and enable physics
    const sprite = this.scene.add.sprite(0, 0, textureKey);
    this.scene.physics.world.enable(sprite);
    sprite.body.setCollideWorldBounds(true);
    sprite.body.setBounce(1, 1);
    sprite.setVisible(false);
    sprite.setActive(false);

    return sprite;
  }

  drawPolygon(graphics, size, sides) {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push({
        x: size * Math.cos(angle),
        y: size * Math.sin(angle),
      });
    }

    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.strokePath();
    graphics.fillPath();
  }

  drawTriangle(graphics, size) {
    this.drawPolygon(graphics, size, 3);
  }

  drawSquare(graphics, size) {
    this.drawPolygon(graphics, size, 4);
  }

  drawPentagon(graphics, size) {
    this.drawPolygon(graphics, size, 5);
  }

  drawHexagon(graphics, size) {
    this.drawPolygon(graphics, size, 6);
  }

  drawOctagon(graphics, size) {
    this.drawPolygon(graphics, size, 8);
  }

  update(time, delta) {
    if (!super.update(time, delta)) {
      return;
    }

    // Auto-fire if cooldown has passed
    if (time - this.lastFiredTime >= this.stats.cooldown) {
      this.attack(time);
    }

    // Update active projectiles
    this.activeProjectiles.forEach((proj, index) => {
      if (!proj.active || !proj.sprite || !proj.sprite.active || !proj.sprite.body) return;

      // Update rotation
      proj.rotation += this.stats.rotationSpeed * (delta / 1000);
      proj.sprite.setRotation(proj.rotation);

      // Update projectile behavior based on state
      switch (proj.state) {
        case "seeking": {
          // Find nearest enemy if no target
          if (!proj.targetEnemy) {
            proj.targetEnemy = this.findNearestEnemy(proj.sprite.x, proj.sprite.y);
          }

          if (
            proj.targetEnemy &&
            proj.targetEnemy.sprite &&
            proj.targetEnemy.sprite.active &&
            !proj.targetEnemy.isDead
          ) {
            // Calculate direction to target
            const dx = proj.targetEnemy.sprite.x - proj.sprite.x;
            const dy = proj.targetEnemy.sprite.y - proj.sprite.y;
            const angle = Math.atan2(dy, dx);

            // Update velocity with seeking behavior
            const velocity = {
              x: Math.cos(angle) * this.stats.seekingSpeed,
              y: Math.sin(angle) * this.stats.seekingSpeed,
            };
            proj.sprite.body.setVelocity(velocity.x, velocity.y);
          } else {
            // No valid target, continue in current direction
            const currentAngle = proj.sprite.rotation;
            proj.sprite.body.setVelocity(
              Math.cos(currentAngle) * this.stats.speed,
              Math.sin(currentAngle) * this.stats.speed
            );
            proj.targetEnemy = null;
          }
          break;
        }
      }

      // Update trail with performance optimizations
      if (time - proj.lastTrailTime >= this.stats.trailSpacing * 1000) {
        // Remove old positions before adding new ones
        while (proj.trailPositions.length >= this.stats.trailLength) {
          proj.trailPositions.pop();
        }

        proj.trailPositions.unshift({
          x: proj.sprite.x,
          y: proj.sprite.y,
          rotation: proj.rotation,
          time: time,
        });
        proj.lastTrailTime = time;
      }

      // Update trail sprites with optimized batch updates
      const trailSprites = this.trailPools[index];
      const shapeType = this.stats.shapeTypes[index % this.stats.shapeTypes.length];
      const glowColor =
        this.currentLevel === this.maxLevel ? this.maxLevelColors.energy : this.shapeColors[shapeType].energy;

      trailSprites.forEach((trailSprite, i) => {
        if (i < proj.trailPositions.length) {
          const pos = proj.trailPositions[i];
          if (!trailSprite.visible) {
            trailSprite.setActive(true).setVisible(true);
          }
          trailSprite.setPosition(pos.x, pos.y);
          trailSprite.setRotation(pos.rotation);

          // Batch the visual updates
          const fadeRatio = 1 - i / this.stats.trailLength;
          const scaleRatio = Math.pow(this.stats.trailScale, i);
          trailSprite
            .setAlpha(this.stats.trailAlpha * fadeRatio)
            .setScale(proj.sprite.scale * scaleRatio)
            .setTint(glowColor);
        } else if (trailSprite.visible) {
          trailSprite.setActive(false).setVisible(false);
        }
      });

      // Check for enemy collisions
      const enemies = this.scene.enemies?.filter((e) => e && e.sprite && e.sprite.active && !e.isDead) || [];
      enemies.forEach((enemy) => {
        if (proj.active && proj.pierceCount > 0) {
          const distance = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, enemy.sprite.x, enemy.sprite.y);

          if (distance < 30) {
            // Collision radius
            this.handleHit(enemy, proj);
          }
        }
      });

      // Check if projectile is out of range
      const distanceFromStart = Phaser.Math.Distance.Between(
        proj.sprite.x,
        proj.sprite.y,
        this.player.sprite.x,
        this.player.sprite.y
      );

      if (distanceFromStart > this.stats.range) {
        this.deactivateProjectile(proj);
      }

      // Update epic effects
      if (this.currentLevel === this.maxLevel && proj.active) {
        // Pulsing effect
        if (this.stats.pulsingEffect) {
          const pulseTime = time * this.stats.pulseFrequency;
          const pulseScale = 1 + Math.sin(pulseTime) * 0.2;
          proj.sprite.setScale(this.stats.scale * pulseScale);
        }

        // Rainbow trail effect
        if (this.stats.rainbowTrail) {
          const rainbow = Phaser.Display.Color.HSVColorWheel();
          const index = Math.floor((time / 100) % rainbow.length);
          const color = rainbow[index].color;
          proj.sprite.setTint(color);
        }

        // Energy field effect
        if (this.stats.energyField) {
          const fieldAlpha = 0.3 + Math.sin(time * this.stats.energyFieldPulseRate) * 0.2;
          if (!proj.energyField) {
            proj.energyField = this.scene.add.circle(
              proj.sprite.x,
              proj.sprite.y,
              this.stats.energyFieldRadius,
              this.maxLevelColors.primary,
              fieldAlpha
            );
          }
          proj.energyField.setPosition(proj.sprite.x, proj.sprite.y);
          proj.energyField.setAlpha(fieldAlpha);

          // Damage enemies in energy field
          const enemies = this.scene.enemies?.filter((e) => e && e.sprite && e.sprite.active && !e.isDead) || [];
          enemies.forEach((enemy) => {
            const distance = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, enemy.sprite.x, enemy.sprite.y);
            if (distance <= this.stats.energyFieldRadius) {
              enemy.takeDamage(this.stats.energyFieldDamage * (delta / 1000));
            }
          });
        }
      }
    });
  }

  attack(time) {
    this.lastFiredTime = time;

    // Calculate how many new projectiles we can fire
    const currentActiveCount = this.activeProjectiles.filter((p) => p.active).length;
    const maxNewProjectiles = Math.min(this.stats.projectileCount, this.maxProjectiles - currentActiveCount);

    // Fire multiple projectiles in a spread pattern
    for (let i = 0; i < maxNewProjectiles; i++) {
      const angleOffset = ((i * 360) / this.stats.projectileCount) * (Math.PI / 180);
      this.fireProjectile(angleOffset);
    }
  }

  fireProjectile(angleOffset = 0) {
    const proj = this.activeProjectiles.find((p) => !p.active);
    if (!proj) return;

    const player = this.player.sprite;

    // Set initial position with offset
    const startAngle = angleOffset;
    const startX = player.x + Math.cos(startAngle) * 50;
    const startY = player.y + Math.sin(startAngle) * 50;

    // Initialize projectile
    proj.active = true;
    proj.sprite.setActive(true).setVisible(true);
    proj.sprite.setPosition(startX, startY);
    proj.sprite.setScale(this.stats.scale);

    // Ensure physics body is enabled and exists
    if (!proj.sprite.body) {
      this.scene.physics.world.enable(proj.sprite);
    }

    proj.pierceCount = this.stats.pierce;
    proj.rotation = startAngle;
    proj.trailPositions = [];
    proj.lastTrailTime = 0;
    proj.targetEnemy = null;
    proj.state = "seeking";

    // Set initial velocity
    const velocity = {
      x: Math.cos(startAngle) * this.stats.speed,
      y: Math.sin(startAngle) * this.stats.speed,
    };
    proj.sprite.body.setVelocity(velocity.x, velocity.y);

    // Add glow effect
    const shapeType = this.stats.shapeTypes[0];
    const glowColor =
      this.currentLevel === this.maxLevel ? this.maxLevelColors.primary : this.shapeColors[shapeType].primary;
    proj.sprite.setTint(glowColor);
  }

  findNearestEnemy(x, y) {
    let nearestEnemy = null;
    let nearestDistance = Infinity;

    const enemies = this.scene.enemies?.filter((e) => e && e.sprite && e.sprite.active && !e.isDead) || [];
    enemies.forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(x, y, enemy.sprite.x, enemy.sprite.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    return nearestEnemy;
  }

  handleHit(enemy, projectile) {
    // Apply damage and create hit effect
    enemy.takeDamage(this.stats.damage);
    this.createHitEffect(enemy.sprite.x, enemy.sprite.y);
    projectile.pierceCount--;

    // Level 8 Geometric Convergence Effect
    if (this.currentLevel === this.maxLevel && this.stats.geometricConvergence) {
      const angleStep = (Math.PI * 2) / this.stats.convergenceBurstCount;
      const startPoint = { x: enemy.sprite.x, y: enemy.sprite.y };

      // Pre-calculate common values
      const range = this.stats.convergenceRange;
      const damage = this.stats.convergenceDamage;

      for (let i = 0; i < this.stats.convergenceBurstCount; i++) {
        const angle = angleStep * i;
        const endPoint = {
          x: startPoint.x + Math.cos(angle) * range,
          y: startPoint.y + Math.sin(angle) * range,
        };

        // Simplified burst effect
        const burst = this.scene.add.sprite(startPoint.x, startPoint.y, projectile.sprite.texture);
        burst.setScale(this.stats.convergenceScale);
        burst.setTint(this.maxLevelColors.primary);
        burst.setAlpha(0.7);

        // Faster, simpler animation
        this.scene.tweens.add({
          targets: burst,
          x: endPoint.x,
          y: endPoint.y,
          scale: 0.1,
          alpha: 0,
          duration: this.stats.convergenceLifetime,
          ease: "Power1",
          onComplete: () => {
            burst.destroy();
          },
        });

        // Optimized enemy damage check
        const enemies =
          this.scene.enemies?.filter((e) => e !== enemy && e.sprite && e.sprite.active && !e.isDead) || [];

        enemies.forEach((targetEnemy) => {
          const dx = targetEnemy.sprite.x - startPoint.x;
          const dy = targetEnemy.sprite.y - startPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < range * 0.5) {
            // Reduced damage range
            targetEnemy.takeDamage(damage);
          }
        });
      }
    }

    if (projectile.pierceCount <= 0) {
      this.deactivateProjectile(projectile);
    }
  }

  createHitEffect(x, y) {
    // Hit effect removed
    return;
  }

  deactivateProjectile(projectile) {
    if (projectile.sprite) {
      projectile.active = false;
      projectile.sprite.setActive(false).setVisible(false);
      projectile.sprite.body.setVelocity(0, 0);
      projectile.trailPositions = [];

      // Hide trail sprites
      const trailPool = this.trailPools[this.activeProjectiles.indexOf(projectile)];
      if (trailPool) {
        trailPool.forEach((sprite) => {
          sprite.setActive(false).setVisible(false);
        });
      }
    }

    // Clean up epic effects
    if (projectile.orbitalShards) {
      projectile.orbitalShards.forEach((shard) => shard.destroy());
      projectile.orbitalShards = null;
    }
    if (projectile.energyField) {
      projectile.energyField.destroy();
      projectile.energyField = null;
    }
  }

  levelUp() {
    if (this.currentLevel < this.maxLevel) {
      // Instead of destroying, just deactivate existing projectiles
      this.activeProjectiles.forEach((proj) => {
        if (proj.sprite) {
          proj.sprite.setActive(false).setVisible(false);
        }
      });

      // Deactivate trail pools
      this.trailPools.forEach((pool) => {
        pool.forEach((sprite) => {
          if (sprite) {
            sprite.setActive(false).setVisible(false);
          }
        });
      });

      this.currentLevel++;
      this.stats = { ...this.levelConfigs[this.currentLevel] };

      // Defer creation to next frame to prevent lag
      this.scene.time.delayedCall(0, () => {
        this.createProjectiles();
      });
    }
  }
}
