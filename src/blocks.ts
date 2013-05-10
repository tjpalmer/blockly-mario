module blockly_mario {

Blockly.Language.agent_act = {
  init: function() {
    this.setColour(290);
    this.appendDummyInput().appendTitle("activate");
    this.appendValueInput('ACTION');
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

function valueToCode(block, name: string, order) =>
  Blockly.JavaScript.valueToCode(block, name, order);

}
