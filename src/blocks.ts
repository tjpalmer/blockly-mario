module blockly_mario {

Blockly.Language.agent_act = {
  init: function() {
    this.setColour(290);
    this.appendDummyInput().appendTitle("activate");
    this.appendValueInput('ACTION').setCheck(String);
    this.appendValueInput('VALUE').setCheck(Boolean);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("");
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
          ["down", 'down']
        ]),
        'VALUE'
      );
    this.setInputsInline(true);
    this.setOutput(true, String);
    this.setTooltip('');
  }
};

Blockly.Language.agent_isActive = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput().appendTitle("is");
    this.appendValueInput('ACTION').setCheck(String);
    this.appendDummyInput().appendTitle("active");
    this.setInputsInline(true);
    this.setOutput(true, Boolean);
    this.setTooltip("");
  }
};

Blockly.JavaScript.agent_act = function() {
  var action: string =
    valueToCode(this, 'ACTION', Blockly.JavaScript.ORDER_NONE);
  var value: string =
    valueToCode(this, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT);
  // For the moment, this works directly on key presses, but the current action
  // string names ('down', 'left', ...) could be used differently in the future,
  // if wanted.
  var code = [
    "Enjine.KeyboardInput.Pressed[",
      actionKeyCodeExpr(action),
    "] = ",
      value,
    ";\n"
  ].join("");
  // All done.
  return code;
};

Blockly.JavaScript.agent_action = function() {
  // The values here are used directly as string contents.
  var code = '"' + this.getTitleValue('VALUE') + '"';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript.agent_isActive = function() {
  var action: string =
    valueToCode(this, 'ACTION', Blockly.JavaScript.ORDER_NONE);
  var code = "Enjine.KeyboardInput.Pressed[" + actionKeyCodeExpr(action) + "]";
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

function valueToCode(block, name: string, order) =>
  Blockly.JavaScript.valueToCode(block, name, order);

/// Map from action names to Enjine.Keys names.
function actionKeyCodeExpr(nameExpr: string) => [
  "Enjine.Keys[{", [
    'down: "Down"',
    'left: "Left"',
    'jump: "S"',
    'right: "Right"',
    'shoot: "A"',
    'up: "Up"',
  ].join(", "),
  "}[",
    nameExpr,
  "]]"].join("");

}
