/// <reference path="blockly.d.ts" />
/// <reference path="mario.d.ts" />

module blockly_mario {

window.onload = function() {
  // TODO Support telling mario where to load things!
  new Enjine.Application().Initialize(
    new Mario.LoadingState("../mariohtml5/"), 320, 240
  );
  Blockly.inject($('blockly'), {path: "../blockly/", toolbox: $('toolbox')});
};

function $(id) {
  return document.getElementById(id);
}

}
