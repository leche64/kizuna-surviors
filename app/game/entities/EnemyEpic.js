import EnemyAdvanced from './EnemyAdvanced';
import Coin from '../entities/Coin';

class EnemyEpic extends EnemyAdvanced {
    constructor(scene, x, y, texture, config = {}) {
        // Set epic enemy specific defaults with even higher stats
        const epicConfig = {
            maxHealth: 400,  // Double the advanced enemy health
            moveSpeed: Phaser.Math.FloatBetween(2.4, 2.6),  // Even faster than advanced
            defense: 4,  // Double defense
            attackSpeed: 1.4,  // 40% faster attacks
            attackDamage: 18,  // 50% more damage than advanced
            scale: 0.44,  // Slightly larger than advanced (0.42)
            trailTint: 0x990000,  // Dark red trail
            clickDamage: 60,  // Higher click damage
            ...config
        };

        super(scene, x, y, texture, epicConfig);

        // Epic enemy specific properties
        this.type = 'epic';
        
        // Create dark red aura
        this.createAura();
    }

    createAura() {
        // Create a circle for the aura
        this.aura = this.scene.add.circle(this.x, this.y, 20, 0x660000, 0.3);
        this.aura.setDepth(this.sprite.depth - 1);  // Place behind the enemy
        
        // Add pulsing animation
        this.scene.tweens.add({
            targets: this.aura,
            scale: { from: 0.8, to: 1.2 },
            alpha: { from: 0.3, to: 0.1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update() {
        super.update();
        
        // Update aura position
        if (this.aura) {
            this.aura.setPosition(this.x, this.y);
        }
    }

    destroy() {
        // Clean up aura
        if (this.aura) {
            this.aura.destroy();
        }
        super.destroy();
    }

    die() {
        // Epic enemies always drop coins during testing
        const coin = new Coin(this.scene, this.sprite.x, this.sprite.y, 5);
        if (!this.scene.coins) {
            console.error('Coins array not initialized!');
            this.scene.coins = [];
        }
        this.scene.coins.push(coin);
        
        super.die();
    }
}

export default EnemyEpic;