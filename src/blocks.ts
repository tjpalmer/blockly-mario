module blockly_mario {

Blockly.Language.agent_act = {
  init: function() {
    this.setColour(160);
    this
      .appendDummyInput()
      .appendTitle("activate")
      .appendTitle(
        new Blockly.FieldDropdown([
          ["jump", 'JUMP'],
          ["shoot", 'SHOOT'],
          ["left", 'LEFT'],
          ["right", 'RIGHT'],
          ["up", 'UP'],
          ["down", 'DOWN']
        ]),
        'ACTION'
      );
    this.appendValueInput("VALUE").setCheck(Boolean);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("");
  }
};

Blockly.Language.agent_is_active = {
  init: function() {
    this.setColour(160);
    this
      .appendDummyInput()
      .appendTitle("is")
      .appendTitle(
        new Blockly.FieldDropdown([
          ["jump", 'JUMP'],
          ["shoot", 'SHOOT'],
          ["left", 'LEFT'],
          ["right", 'RIGHT'],
          ["up", 'UP'],
          ["down", 'DOWN']
        ]),
        'ACTION'
      )
      .appendTitle("active");
    this.setOutput(true, Boolean);
    this.setTooltip("");
  }
};

Blockly.JavaScript.agent_act = function() {
  var dropdown_action = this.getTitleValue('ACTION');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

}
