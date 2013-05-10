/// <reference path="blockly.d.ts" />
/// <reference path="blocks.ts" />
/// <reference path="mario.d.ts" />

module blockly_mario {

var aiFunction: () => void;

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
  // Reset pause because we otherwise just get a blank canvas.
  $input('pause').checked = false;
  $('pause').onclick = handlePause;
  $('update').onclick = updateCode;

  // Disable AI control until update.
  $input('ai').disabled = true;
};

class AiUpdate {
  constructor(private base: any) {}
  Update(delta: number): void {
    // TODO Mario AI calls!
    var aiActive = $input('ai').checked;
    var oldPressed: any;
    if (aiActive) {
      // Copy keys pressed for later restore.
      oldPressed = Enjine.KeyboardInput.Pressed;
      Enjine.KeyboardInput.Pressed = {};
      Enjine.KeyboardInput.Element = null;
      if (aiFunction) {
        aiFunction();
      }
    }
    // Run the base update either way.
    this.base.Update(delta);
    if (aiActive) {
      // Restore old keyboard layout.
      Enjine.KeyboardInput.Pressed = oldPressed;
      Enjine.KeyboardInput.Element = $('canvas');
    }
  }
}

function $(id) => <HTMLElement>document.getElementById(id);

function $input(id) => <HTMLInputElement>$(id);

function copySimpleShallow(object) {
  var copy = {};
  for (var key in object) {
    copy[key] = object[key];
  }
  return copy;
}

function handleKeyDown(base) {
  // Using function here because => ties this, and I want standard one.
  return function(event: KeyboardEvent) {
    // TODO Add space code (32) to Enjine.Keys?
    if (this.IsActive() && event.keyCode == 32) {
      // Toggle on space.
      // Handle this at the event itself so we don't need to track from time to
      // time.
      var pause = $input('pause');
      pause.checked = !pause.checked;
      handlePause();
    } else {
      // Standard handling.
      base.call(this, event);
    }
  };
}

function handlePause() {
  if ($input('pause').checked) {
    application.timer.Stop();
  } else {
    application.timer.Start();
  }
}

function updateCode() {
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  // Wrap in a function we can call at each update.
  // TODO Do I want to capture or use time delta?
  code = ["(function() {", code, "})"].join("\n");
  //console.log(code);
  try {
    aiFunction = eval(code);
    $input('ai').disabled = false;
  } catch (e) {
    alert("Error building code.");
    aiFunction = null;
    $input('ai').checked = false;
    $input('ai').disabled = true;
    // Disable AI control.
    throw e;
  }
}

}
