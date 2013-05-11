/// <reference path="blockly.d.ts" />
/// <reference path="blocks.ts" />
/// <reference path="mario.d.ts" />

module blockly_mario {

var aiFunction: () => any;

var application: any;

window.onload = function() {
  // Mario.
  application = new Enjine.Application();
  application.Initialize(new Mario.LoadingState("../mariohtml5/"), 320, 240);
  // Inject our own timer handler for ai logic.
  application.timer.UpdateObject = new AiUpdate(application);
  redefine(Enjine.KeyboardInput, 'KeyDownEvent', defineKeyDown);

  // Blockly.
  Blockly.inject($('blockly'), {path: "../blockly/", toolbox: $('toolbox')});
  // Override code finish, because we want to wrap the main code in a function
  // but retain variables outside it for persistence.
  // The alternative is to hack the generated code after the fact. No fun there.
  redefine(Blockly.JavaScript, 'finish', defineFinishCode);
  Blockly.addChangeListener(workspaceChanged);

  // Event handlers.
  // Focus game when disabling AI.
  // When by mouse, this make sense. TODO Verify by mouse using cleverness?
  $('ai').onclick = () => {if (!$input('ai').checked) $('canvas').focus()};
  // Reset pause because we otherwise just get a blank canvas.
  $input('pause').checked = false;
  $('pause').onclick = handlePause;
  $('update').onclick = updateCode;

  // Restore saved blocks if any.
  var blocksXml = localStorage.getItem(storageName('blocks'));
  if (blocksXml) {
    var dom = Blockly.Xml.textToDom(blocksXml);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
  }
  // No op, but hey. Timeout because it wasn't disabling the button right.
  setTimeout(() => {updateCode()}, 0);
};

/// TODO Rename this to 'AiStep'?
class AiUpdate {
  constructor(private base: any) {}
  Update(delta: number): void {
    // TODO Mario AI calls!
    var aiActive = $input('ai').checked && Boolean(aiFunction);
    var oldPressed: any;
    if (aiActive) {
      // Run our AI, then extract the key presses from the actions.
      var actions = aiFunction();
      var pressed = {};
      var keyMap = {
        down: "Down",
        left: "Left",
        jump: "S",
        right: "Right",
        shoot: "A",
        up: "Up",
      };
      for (var actionName in actions) {
        // Enjine checks loosely against null for false, so don't even bother to
        // set pressed if not true.
        if (actions[actionName]) {
          pressed[Enjine.Keys[keyMap[actionName]]] = true;
        }
      }
      // Copy keys pressed for later restore.
      oldPressed = Enjine.KeyboardInput.Pressed;
      // Assign the new values, and override need for focus.
      Enjine.KeyboardInput.Pressed = pressed;
      Enjine.KeyboardInput.Element = null;
    }
    // Run the base update either way.
    this.base.Update(delta);
    if (aiActive) {
      // Restore old keyboard layout and focus requirement.
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

/// Wraps the main generated statements in a returned function.
/// Generated variables and functions should be outside this.
function defineFinishCode(base) {
  // TODO Indenting code lines would be nice.
  return (code: string) => base([
    // Declare $$actions outside the returned function so that user-defined
    // procedures also can access it.
    "var $$actions;",
    "return function() {",
      // However, reset the value to empty at each decision step.
      // TODO Indenting code here would be great.
      "$$actions = {};",
      code,
      "return $$actions;",
    "};",
  ].join("\n"));
}

function defineKeyDown(base) {
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

/// Allows easy wrap overriding.
function redefine(object, name: string, define): void {
  object[name] = define(object[name]);
}

/// From BlocklyStorage strategy to keep named for this url.
function storageName(name: string) =>
  window.location.href.split("#")[0] + "#" + name;

function updateCode() {
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  // Wrap in a function we can call at each update.
  // TODO Do I want to capture or use time delta?
  code = ["(function() {", code, "})"].join("\n");
  //console.log(code);
  try {
    // The code actually returns the function from inside it, so call the eval
    // result immediately.
    aiFunction = eval(code)();
    $input('ai').disabled = false;
    // We got new code. Disable update for now.
    $input('update').disabled = true;
  } catch (e) {
    alert("Error building code.");
    aiFunction = null;
    $input('ai').checked = false;
    $input('ai').disabled = true;
    // Disable AI control.
    throw e;
  }
}

function workspaceChanged() {
  // Let the user know they can recompile.
  $('update').disabled = false;
  // Also save immediately, although undo/redo would sure be nice.
  var xml = Blockly.Xml.domToText(
    Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)
  );
  window.localStorage.setItem(storageName('blocks'), xml);
}

}
