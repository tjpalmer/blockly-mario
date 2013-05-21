/// Support functions for interfacing between AI code and the game world.

module blockly_mario {

var screenRadius = {X: 160, Y: 120};

export class Support {

  constructor(public app: any) {}

  enemies(): any[] {
    if (!this.gameStateIs(Mario.LevelState)) return [];
    var enemies: any[] = this.gameState().Sprites.Objects.filter(sprite =>
      sprite instanceof Mario.Enemy ||
      sprite instanceof Mario.BulletBill ||
      // Shells are only dangerous when in motion.
      Boolean(sprite instanceof Mario.Shell && sprite.Facing)
    );
    return enemies;
  }

  gameState() {
    return this.app.stateContext.State;
  }

  gameStateIs(stateClass) {
    return this.gameState() instanceof stateClass;
  }

  spriteType(sprite): string {
    if (sprite instanceof Mario.BulletBill) {
      return 'BULLET_BILL';
    } else if (sprite instanceof Mario.Character) {
      return 'MARIO';
    } else if (sprite instanceof Mario.FlowerEnemy) {
      // The recorded type for these is actually Spiky.
      return 'PIRANHA_PLANT';
    } else if (sprite instanceof Mario.Enemy) {
      switch (sprite.Type) {
        case Mario.Enemy.Goomba: return 'GOOMBA';
        case Mario.Enemy.GreenKoopa: return 'GREEN_KOOPA';
        case Mario.Enemy.RedKoopa: return 'RED_KOOPA';
        case Mario.Enemy.Spiky: return 'SPINY';
      }
    }
    // TODO Flesh out!
    return 'UNKNOWN';
  }

  spriteValue(sprite, key: string): number {
    // Keys are like 'POSITION_X', where first is 'POSITION', and last is 'X'.
    // If no underscore, then first and last would be the same.
    var keys = key.split(/_+/);
    var first = keys[0];
    var last = keys[keys.length - 1];
    switch (first) {
      case 'POSITION': return this.getPosition(sprite, last);
      case 'RADIUS': return this.getRadius(sprite, last);
      case 'VELOCITY': return this.getVelocity(sprite, last);
    }
  }

  private getPosition(sprite, axis: string): number {
    var value: number;
    var mario = Mario.MarioCharacter;
    var state = this.gameState();

    if (state instanceof Mario.LevelState) {
      if (sprite === mario) {
        // Mario relative to bottom middle.
        // No vertical scrolling, and make pits clearer to set bottom at 0.
        value = mario[axis];
        if (axis == 'X') {
          value -= state.Camera.X;
        }
        // No size constants defined in mariohtml5.
        // TODO Make my own? Expose as blocks?
        value -= {X: screenRadius.X, Y: 2 * screenRadius.Y}[axis];
      } else {
        // All else relative to mario.
        // TODO Undefined if old data. Is that okay?
        value = sprite[axis] - mario[axis];
      }
      if (axis == 'Y') {
        // Put positions at centers rather than at bases.
        // TODO Really? It simplifies size info at least.
        // We're still in "down is positive" land, so subtract.
        // TODO Does height and everything else still work in map state?
        value -= sprite.Height / 2;
      }
    } else if (state instanceof Mario.MapState) {
      if (sprite === mario) {
        // Info comes from elsewhere for the map state, although the mario
        // sprite is constant throughout the game.
        value = state[axis + 'Mario'];
        // Bottom-left origin, since no scrolling.
        if (axis == 'Y') {
          value -= 2 * screenRadius[axis];
        }
        // Large or small Mario seems to be about 8 off. Centers at feet.
        // Needs +8 for X and -8 for Y, but Y gets negated later, so +8 for
        // both.
        // TODO Any size for looking at on this?
        value += 8;
      }
    } else {
      value = Number.NaN;
    }

    // We want up is positive. Standard Cartesian.
    if (axis === 'Y') {
      value *= -1;
    }
    return value;
  }

  private getRadius(sprite, axis: string): number {
    try {
      if (axis == 'X') {
        // Width is already in radius form.
        return sprite.Width;
      } else { // 'Y'
        // Convert to "radius".
        return sprite.Height / 2;
      }
    } catch (e) {
      // Play fast and loose.
      return Number.NaN;
    }
  }

  private getVelocity(sprite, axis: string): number {
    var value: number;
    if (this.gameStateIs(Mario.LevelState)) {
      // Yes, this is velocity, despite the 'a'.
      // There's a convergence issue for y velocity when on the ground.
      // It trends toward 0 but doesn't get there very fast.
      // TODO Track X and Y at each time step for all sprites and do a diff?
      // TODO Any changes directly to mario code?
      value = sprite[axis + 'a'];
    } else {
      value = Number.NaN;
    }

    // We want up is positive. Standard Cartesian.
    if (axis === 'Y') {
      value *= -1;
    }
    return value;
  }

}

}
