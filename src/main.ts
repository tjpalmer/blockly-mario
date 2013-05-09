/// <reference path="blockly.d.ts" />
/// <reference path="blocks.ts" />
/// <reference path="mario.d.ts" />

module blockly_mario {

var application: any;

window.onload = function() {
  // Mario.
  application = new Enjine.Application();
  application.Initialize(new Mario.LoadingState("../mariohtml5/"), 320, 240);
  // Inject our own timer handler for ai logic.
  application.timer.UpdateObject = new AiUpdate(application);
  Enjine.KeyboardInput.KeyDownEvent =
    handleKeyDown(Enjine.KeyboardInput.KeyDownEvent);

  // Blockly.
  Blockly.inject($('blockly'), {path: "../blockly/", toolbox: $('toolbox')});

  // Event handlers.
  $('pause').onclick = handlePause;
};

class AiUpdate {
  constructor(private base: any) {}
  Update(delta: number): void {
    // TODO Mario AI calls!
    this.base.Update(delta);
  }
}

function $(id): HTMLElement {
  return document.getElementById(id);
}

function handleKeyDown(base) {
  return function(event: KeyboardEvent) {
    if (this.IsActive() && event.keyCode == 32) {
      // Toggle on space.
      // Handle this at the event itself so we don't need to track from time to
      // time.
      var pause = <HTMLInputElement>$('pause');
      pause.checked = !pause.checked;
      handlePause();
    } else {
      // Standard handling.
      base.call(this, event);
    }
  };
}

function handlePause() {
  if ((<HTMLInputElement>$('pause')).checked) {
    application.timer.Stop();
  } else {
    application.timer.Start();
  }
}

}
