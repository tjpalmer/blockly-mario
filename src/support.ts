/// Support functions for interfacing between AI code and the game world.

module blockly_mario {

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

  spriteValue(sprite, key: string) {
    var value;
    var mario = Mario.MarioCharacter;
    // Keys are like 'POSITION_X', where first is 'POSITION', and last is 'X'.
    // If no underscore, then first and last would be the same.
    var keys = key.split(/_+/);
    var first = keys[0];
    var last = keys[keys.length - 1];
    switch (first) {
      case 'POSITION': {
        value = sprite[last] - mario[last];
        break;
      }
    }
    if (last === 'X') {
      // X should be relative to Mario facing.
      // Fully egocentric coordinates here.
      // TODO Really???? Left and right commands are non-egocentric.
      value *= mario.Facing;
    }
    if (last === 'Y') {
      // We want up is positive. Standard Cartesian.
      value *= -1;
    }
    return value;
  }

}

}
