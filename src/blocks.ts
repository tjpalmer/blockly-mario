module blockly_mario {

Blockly.Language.agent_act = {
  init: function() {
    this.setColour(290);
    this.appendValueInput('ACTION').appendTitle("activate");
    //this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(
      "Activate or keep active the given action. " +
      "Actions otherwise deactivate at each time step.\n\n" +
      "To actually jump or shoot more than once, it must be inactive between."
    );
  }
};

Blockly.Language.agent_action = {
  init: function() {
    this.setColour(160);
    this
      .appendDummyInput()
      .appendTitle(
        new Blockly.FieldDropdown([
          ["jump", 'JUMP'],
          ["shoot", 'SHOOT'],
          ["left", 'LEFT'],
          ["right", 'RIGHT'],
          ["up", 'UP'],
          ["down", 'DOWN'],
        ]),
        'VALUE'
      );
    this.setOutput(true, String);
    this.setTooltip(
      "Choose an action. Jump also starts levels. Shoot also runs faster."
    );
  }
};

Blockly.Language.agent_enemies = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput().appendTitle("enemies");
    this.setOutput(true, Array);
    this.setTooltip("A list of all active enemies.");
  }
};

Blockly.Language.agent_enemyTypeOption = {
  init: function() {
    this.setColour(160);
    this
      .appendDummyInput()
      .appendTitle(
        new Blockly.FieldDropdown([
          ["bullet bill", 'BULLET_BILL'],
          ["goomba (mushroom)", 'GOOMBA'],
          ["green koopa (turtle)", 'GREEN_KOOPA'],
          ["piranha plant", 'PIRANHA_PLANT'],
          ["red koopa (turtle)", 'RED_KOOPA'],
          ["spiny (turtle)", 'SPINY'],
        ]),
        'VALUE'
      );
    this.setOutput(true, String);
    this.setTooltip("Choose from the list of possible enemy types.");
  }
};

Blockly.Language.agent_mario = {
  init: function() {
    this.setColour(0);
    this.appendDummyInput().appendTitle("mario");
    this.setOutput(true, "Sprite");
    this.setTooltip("Mario player character.");
  }
};

Blockly.Language.agent_mode = {
  init: function() {
    this.setColour(120);
    this
      .appendDummyInput()
      .appendTitle("game mode is")
      .appendTitle(
        new Blockly.FieldDropdown([
          ["level", 'LEVEL'],
          ["map", 'MAP'],
          ["title", 'TITLE'],
          ["lose", 'LOSE'],
          ["win", 'WIN'],
        ]),
        'MODE'
      );
    this.setOutput(true, Boolean);
    this.setTooltip("Test the current game mode (screen type).");
  }
};

Blockly.Language.agent_onGround = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput().appendTitle("on ground");
    this.setOutput(true, Boolean);
    this.setTooltip("On ground after last time step or not.");
  }
};

Blockly.Language.agent_spriteType = {
  init: function() {
    this.setColour(160);
    this.appendValueInput("SPRITE").setCheck("Sprite").appendTitle("type of");
    this.setOutput(true, String);
    this.setTooltip("The type identifier of any character or block.");
  }
};

Blockly.Language.agent_tileSize = {
  init: function() {
    this.setColour(230);
    this
      .appendDummyInput()
      .appendTitle("tile")
      .appendTitle(new Blockly.FieldDropdown([
          ["radius", 'RADIUS'],
          ["size", 'SIZE']
        ]),
        'VALUE'
      );
    this.setOutput(true, Number);
    this.setTooltip('The tile "radius" or full size (edge length).');
  }
};

Blockly.Language.agent_tileTypeAt = {
  init: function() {
    this.setColour(160);
    this.appendValueInput("X").setCheck(Number).appendTitle("tile type at x");
    this.appendValueInput("Y").setCheck(Number).appendTitle("y");
    this.setInputsInline(true);
    this.setOutput(true, String);
    this.setTooltip("Tile type at pixel offset (x, y) from Mario's center.");
  }
};

Blockly.Language.agent_tileTypeOption = {
  init: function() {
    this.setColour(160);
    this
      .appendDummyInput()
      .appendTitle(
        new Blockly.FieldDropdown([
          ["air", 'AIR'],
          // TODO bill blaster?
          ["brick", 'BRICK'],
          // TODO Coin, fire flower here or with mushroom?
          ["coin", 'COIN'],
          ["off screen", 'OFF_SCREEN'],
          ["pipe", 'PIPE'],
          ["question", 'QUESTION'],
          ["solid", 'SOLID'],
          ["surface (top only)", 'SURFACE'],
        ]),
        'VALUE'
      );
    this.setOutput(true, String);
    this.setTooltip("Choose from the list of possible tile types.");
  }
};

Blockly.Language.agent_value = {
  init: function() {
    this.setColour(230);
    this.appendValueInput("SPRITE");
    this
      .appendDummyInput()
      .appendTitle(
        new Blockly.FieldDropdown([
          ["offset x", 'OFFSET_X'],
          ["offset y", 'OFFSET_Y'],
          ["position x", 'POSITION_X'],
          ["position y", 'POSITION_Y'],
          ["radius x", 'RADIUS_X'],
          ["radius y", 'RADIUS_Y'],
          ["velocity x", 'VELOCITY_X'],
          ["velocity y", 'VELOCITY_Y'],
        ]),
        'VALUE'
      );
    this.setInputsInline(true);
    this.setOutput(true, Number);
    this.setTooltip(
      "Get the requested value for the given animated character.\n" +
      "Positions are refer to center points, " +
      "where right is +X and up is +Y.\n" +
      "Mario's origin point is the center of the screen, " +
      "and all other characters are relative to Mario.\n" +
      "Offset is from tile center."
    );
  }
};

Blockly.JavaScript.agent_act = function() {
  var action: string =
    valueToCode(this, 'ACTION', Blockly.JavaScript.ORDER_NONE);
  // Track actions in a local object we'll return later.
  var code = ["$$actions[", action, "] = true;\n"].join("");
  // All done.
  return code;
};

Blockly.JavaScript.agent_action = directString;

Blockly.JavaScript.agent_enemies = function() {
  return ["$$support.enemies()", Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript.agent_enemyTypeOption = directString;

Blockly.JavaScript.agent_mario = function() {
  return ["Mario.MarioCharacter", Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript.agent_mode = function() {
  var className = {
    LEVEL: "Mario.LevelState",
    LOSE: "Mario.LoseState",
    MAP: "Mario.MapState",
    TITLE: "Mario.TitleState",
    WIN: "Mario.WinState",
  }[this.getTitleValue('MODE')];
  var code = "$$support.gameStateIs(" + className + ")";
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript.agent_onGround = function() {
  var code = "Mario.MarioCharacter.OnGround";
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript.agent_spriteType = function() {
  var sprite = valueToCode(this, 'SPRITE', Blockly.JavaScript.ORDER_NONE);
  var code = ["$$support.spriteType(", sprite, ")"].join("");
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript.agent_tileSize = function() {
  var key = this.getTitleValue('VALUE');
  var code = ["$$support.tileSize('", key, "')"].join("");
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript.agent_tileTypeAt = function() {
  var x = valueToCode(this, 'X', Blockly.JavaScript.ORDER_COMMA);
  var y = valueToCode(this, 'Y', Blockly.JavaScript.ORDER_COMMA);
  var code = ["$$support.tileTypeAt(", x, ", ", y, ")"].join("");
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript.agent_tileTypeOption = directString;

Blockly.JavaScript.agent_value = function() {
  var sprite = valueToCode(this, 'SPRITE', Blockly.JavaScript.ORDER_COMMA);
  var valueKey = this.getTitleValue('VALUE');
  var code = ["$$support.spriteValue(", sprite, ", '", valueKey, "')"].join("");
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

/// Override standard blockly print, since alert isn't really appropriate here.
/// TODO Separate log block and retain alert for print?
/// TODO Some log visible on page? (And plotting, too?)
Blockly.JavaScript.text_print = function() {
  var text = valueToCode(this, 'TEXT', Blockly.JavaScript.ORDER_NONE) || '""';
  return 'console.log(' + text + ');\n';
};

/// The values here are used directly as string contents.
/// Should be used as a method on blocks.
function directString() {
  var code = '"' + this.getTitleValue('VALUE') + '"';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

function valueToCode(block, name: string, order) =>
  Blockly.JavaScript.valueToCode(block, name, order);

}
