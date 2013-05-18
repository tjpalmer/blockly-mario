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

}

}
