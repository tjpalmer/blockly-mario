/// Support functions for interfacing between AI code and the game world.

module blockly_mario {

// Capitalized X and Y for consistency with other mariohtml5 things and such.
var screenRadius = {X: 160, Y: 120};

var tileSize = 16;

export class Support {

  constructor(public app: any) {}

  enemies(): any[] {
    if (!this.gameStateIs(Mario.LevelState)) return [];
    var enemies: any[] = this.gameState().Sprites.Objects.filter(sprite =>
      sprite instanceof Mario.Enemy ||
      sprite instanceof Mario.BulletBill ||
      // Shells are only dangerous when in motion, but list anyway.
      sprite instanceof Mario.Shell
    );
    return enemies;
  }

  gameState() {
    return this.app.stateContext.State;
  }

  gameStateIs(stateClass) {
    return this.gameState() instanceof stateClass;
  }

  powerUps(): any[] {
    if (!this.gameStateIs(Mario.LevelState)) return [];
    var enemies: any[] = this.gameState().Sprites.Objects.filter(sprite =>
      sprite instanceof Mario.Mushroom ||
      sprite instanceof Mario.FireFlower
    );
    return enemies;
  }

  spritePredicate(sprite, key: string): bool {
    var value = false;
    switch (key) {
      case 'ON_GROUND': value = sprite.OnGround; break;
      case 'HAS_FIRE': value = sprite.Fire; break;
      case 'SUPER': value = sprite.Large; break;
      case 'WINGED': value = sprite.Winged; break;
    }
    // Wipe over undefineds and such.
    value = Boolean(value);
    return value;
  }

  spriteType(sprite): string {
    // TODO How to recognize sliding shells?
    if (sprite instanceof Mario.BulletBill) {
      return 'BULLET_BILL';
    } else if (sprite instanceof Mario.Character) {
      return 'MARIO';
    } else if (sprite instanceof Mario.Enemy) {
      if (sprite instanceof Mario.FlowerEnemy) {
        // The recorded type for these is actually Spiky.
        return 'PIRANHA_PLANT';
      }
      // For the rest, type is fine.
      switch (sprite.Type) {
        case Mario.Enemy.Goomba: return 'GOOMBA';
        case Mario.Enemy.GreenKoopa: return 'GREEN_KOOPA';
        case Mario.Enemy.RedKoopa: return 'RED_KOOPA';
        case Mario.Enemy.Spiky: return 'SPINY';
      }
    } else if (sprite instanceof Mario.FireFlower) {
      return 'FIRE_FLOWER';
    } else if (sprite instanceof Mario.Mushroom) {
      return 'SUPER_MUSHROOM';
    } else if (sprite instanceof Mario.Shell) {
      return 'SHELL';
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
      case 'FACING': return this.getFacing(sprite, last);
      case 'OFFSET': return this.getOffset(sprite, last);
      case 'POSITION': return this.getPosition(sprite, last);
      case 'RADIUS': return this.getRadius(sprite, last);
      case 'VELOCITY': return this.getVelocity(sprite, last);
    }
  }

  tileSize(key: string): number {
    var value = tileSize;
    if (key == 'RADIUS') {
      value /= 2;
    }
    return value;
  }

  tileTypeAt(x: number, y: number): string {
    var state = this.gameState();
    if (state instanceof Mario.LevelState) {
      var mario = Mario.MarioCharacter;
      // Put positive down for looking into world data.
      y *= -1;
      // Offset by Mario center.
      x += mario.X;
      y += mario.Y;
      y -= mario.Height / 2;

      // Check limits before we change x and y to tile coordinates.
      // AI can't see more than human could see.
      var camera = state.Camera;
      var screenMinX = camera.X;
      var screenMaxX = screenMinX + 2 * screenRadius.X - 1;
      // Origin at top going down by this point in transform.
      var screenMinY = camera.Y;
      var screenMaxY = screenMinY + 2 * screenRadius.Y - 1;
      if (
        x < screenMinX || y < screenMinY ||
        x > screenMaxX || y > screenMaxY
      ) {
        return 'OFF_SCREEN';
      }

      // Now go to tile coordinates.
      x = Math.floor(x / tileSize);
      y = Math.floor(y / tileSize);

      // Get block type.
      var level = state.Level;
      var type = level.Map[x][y];
      // Change the type number into one of our strings.
      // No constants are defined on these in mariohtml5, I don't think.
      // TODO Add them there?
      switch (type) {
        // Nothing.
        case 0: return 'AIR';

        // Large pipe. TODO Small pipe?
        case 10: case 11: case 26: case 27: return 'PIPE';

        // Hide special natures of bricks. TODO Is 19 used?
        case 16: case 17: case 18: case 19: return 'BRICK';

        // Hide special (mushroominess) case 22. TODO Are 20 or 23 used?
        case 20: case 21: case 22: case 23: return 'QUESTION';

        // TODO Anything other than 34 used?
        // TODO Transform coin into a sprite representation????
        case 32: case 33: case 34: case 35: return 'COIN';

        // Already bumped things. TODO All used?
        case 4: case 5: case 6: case 7:
        // Various block types (stone, wood, metal).
        case 9: case 12: case 28:
        // Internal ground blocks that are listed as non-blocking, but which
        // form parts of blocking groups.
        case 131: case 145: case 147:
        return 'SOLID';
      }

      // Nothing so far, but lots of generic ground exists in this space.
      // Use the info.
      if (type >= 128) {
        var behavior = Mario.Tile.Behaviors[type];
        // Check == rather than & here. These are simples.
        switch (behavior) {
          // I'll commit to double-checking things that I think shouldn't be
          // air here and catch them above in the switch there.
          case 0: return 'AIR';
          case Mario.Tile.BlockAll: return 'SOLID';
          case Mario.Tile.BlockUpper: return 'SURFACE';
        }
      }

      // And in case we see this ...
      console.log("Unknown type: " + type);

    } else if (state instanceof Mario.MapState) {
      // TODO What?
    }
    return 'UNKNOWN';
  }

  private getFacing(sprite, axis: string): number {
    // Axis is always X. TODO Assert?
    // Convert undefined to NaN with plus.
    return +sprite.Facing;
  }

  private getOffset(sprite, axis: string): number {
    var state = this.gameState();
    if (state instanceof Mario.LevelState) {
      // Look at tile center, not lower left.
      var value = sprite[axis];
      if (axis == 'Y') {
        // Count up, not down. Center on sprite.
        value *= -1;
        value += 2 * screenRadius.Y;
        // Hand-tweaked so that on ground minus radius y is 0.
        value += sprite.Height / 2 - 1;
      }
      value %= tileSize;
      // Origin at center.
      value -= tileSize / 2;
      return value;
    }
    return Number.NaN;
  }

  private getPosition(sprite, axis: string): number {
    var value: number;
    var mario = Mario.MarioCharacter;
    var state = this.gameState();

    if (state instanceof Mario.LevelState) {
      if (sprite === mario) {
        // Mario relative to screen center.
        value = mario[axis];
        if (axis == 'X') {
          // TODO Include Y, too, even if always 0?
          value -= state.Camera.X;
        }
        // No size constants defined in mariohtml5.
        // TODO Make my own? Expose as blocks?
        value -= {X: screenRadius.X, Y: screenRadius.Y}[axis];
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

function $(id) => <HTMLElement>document.getElementById(id);

}
