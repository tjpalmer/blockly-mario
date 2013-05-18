module blockly_mario {

Blockly.Language.agent_act = {
  init: function() {
    this.setColour(290);
    this.appendDummyInput().appendTitle("activate");
    this.appendValueInput('ACTION');
    this.setInputsInline(true);
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
          ["jump", 'jump'],
          ["shoot", 'shoot'],
          ["left", 'left'],
          ["right", 'right'],
          ["up", 'up'],
          ["down", 'down'],
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
    this.setTooltip("A list of all enemies (in distance order?).");
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

Blockly.Language.agent_velocity = {
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(230);
    this.appendDummyInput().appendTitle("velocity");
    this.setOutput(true, Array);
    this.setTooltip("Most recent x and y velocity as list of two numbers.");
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

Blockly.JavaScript.agent_action = function() {
  // The values here are used directly as string contents.
  var code = '"' + this.getTitleValue('VALUE') + '"';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript.agent_enemies = function() {
  return ["$$support.enemies()", Blockly.JavaScript.ORDER_MEMBER];
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

Blockly.JavaScript.agent_velocity = function() {
  // Even though it says "a", it's used as velocity in the code.
  // Use standard Cartesian coordinates on Y. Up is positive.
  var code = "[Mario.MarioCharacter.Xa, -Mario.MarioCharacter.Ya]";
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

/// Override standard blockly print, since alert isn't really appropriate here.
/// TODO Separate log block and retain alert for print?
/// TODO Some log visible on page? (And plotting, too?)
Blockly.JavaScript.text_print = function() {
  var text = valueToCode(this, 'TEXT', Blockly.JavaScript.ORDER_NONE) || '""';
  return 'console.log(' + text + ');\n';
};

function valueToCode(block, name: string, order) =>
  Blockly.JavaScript.valueToCode(block, name, order);

}
