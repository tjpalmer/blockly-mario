/// <reference path="blockly.d.ts" />
/// <reference path="blocks.ts" />
/// <reference path="mario.d.ts" />

module blockly_mario {

var application: any;

window.onload = function() {
  // TODO Support telling mario where to load things!
  application = new Enjine.Application();
  application.Initialize(new Mario.LoadingState("../mariohtml5/"), 320, 240);
  Blockly.inject($('blockly'), {path: "../blockly/", toolbox: $('toolbox')});
  $('pause').onclick = handlePause;
};

function $(id): HTMLElement {
  return document.getElementById(id);
}

function handlePause() {
  if (this.checked) {
    application.timer.Stop();
  } else {
    application.timer.Start();
  }
}

}
