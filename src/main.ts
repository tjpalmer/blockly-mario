/// <reference path="blockly.d.ts" />
/// <reference path="blocks.ts" />
/// <reference path="mario.d.ts" />
/// <reference path="support.ts" />

module blockly_mario {

/// The mariohtml5 app.
/// Exported for easier inspection in console.
export var app: any;

// In-page logging functionality.
var lastMessage = null;
export function log(message) {
  var consoleDiv = $('console');
  //var wasScrolled = consoleDiv.scrollTop == consoleDiv.scrollHeight;
  var escaped = String(message).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  // TODO Extract lastMessage by text content???
  if (escaped === lastMessage) {
    // Repeat message. Increment count.
    var entryDiv = <HTMLElement>consoleDiv.lastChild;
    var countSpan = <HTMLElement>entryDiv.firstChild;
    if (!(countSpan instanceof Element)) {
      // Still need to insert the count.
      entryDiv.innerHTML =
        '<span class="log-count">1</span>' + entryDiv.innerHTML;
      countSpan = <HTMLElement>entryDiv.firstChild;
    }
    var count = Number(countSpan.innerHTML);
    countSpan.innerHTML = String(count + 1);
  } else {
    // New message.
    lastMessage = escaped;
    consoleDiv.innerHTML += "<div>" + escaped + "</div>";
  }
  // Keep things from getting out of control.
  while (consoleDiv.childNodes.length > 1000) {
    consoleDiv.removeChild(consoleDiv.firstChild);
  }
  // Too hard to get back to the bottom, but might be nice: if (wasScrolled)
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

var aiFunction: () => any;

var loadClears = false;

window.onload = function() {
  // Mario.
  app = new Enjine.Application();
  app.Initialize(new Mario.LoadingState("../mariohtml5/"), 320, 240);
  // Inject our own timer handler for ai logic.
  app.timer.UpdateObject = new AiUpdate(app);
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
  // Reset checkboxes for Firefox.
  ['ai', 'pause'].forEach(id => {
    $input(id).checked = false;
  });
  $('pause').onclick = handlePause;
  $('update').onclick = updateCode;
  // File opening.
  $('import').addEventListener('click', handleImport, false);
  $('open').addEventListener('click', handleOpen, false);
  $('file-chooser').addEventListener('change', handleFileChosen, false);
  // TODO Testing: $('file-chooser').
  // TODO   addEventListener('click', event => {console.log(event)}, false);

  // Handle console resize.
  window.addEventListener('resize', windowResized, false);
  // And kick off initial sizing.
  windowResized();

  // Restore saved blocks if any.
  var blocksXml = localStorage.getItem(storageName('blocks'));
  if (blocksXml) {
    loadBlocksXml(blocksXml, true);
  }
  // No op, but hey. Timeout because it wasn't disabling the button right.
  setTimeout(() => {updateCode()}, 0);

  // Let play by default.
  $('canvas').focus();
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
        DOWN: 'Down',
        LEFT: 'Left',
        JUMP: 'S',
        RIGHT: 'Right',
        SHOOT: 'A',
        UP: 'Up',
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

function $a(id) => <HTMLLinkElement>$(id);

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
      // Toggle pause on space.
      // Handle this at the event itself so we don't need to track from time to
      // time.
      var pause = $input('pause');
      pause.checked = !pause.checked;
      handlePause();
    } else if (this.IsActive() && event.keyCode == 13) {
      // Toggle AI on enter.
      var ai = $input('ai');
      ai.checked = !ai.checked;
    } else {
      // Standard handling.
      base.call(this, event);
    }
  };
}

function handleFileChosen(event) {
  var files = event.target.files;
  if (!files.length) {
    // Nothing chosen. TODO Is that expected by the user in some cases?
    return;
  }
  var reader = new FileReader;
  reader.onload = (event) => {
    loadBlocksXml(event.target.result, loadClears);
  };
  reader.readAsText(files[0]);
}

function handleFileLoaded() {
}

function handleImport() {
  loadClears = false;
  $('file-chooser').click();
}

function handleOpen() {
  loadClears = true;
  $('file-chooser').click();
}

function handlePause() {
  if ($input('pause').checked) {
    app.timer.Stop();
  } else {
    app.timer.Start();
  }
}

function loadBlocksXml(blocksXml, clear) {
  try {
    var dom = Blockly.Xml.textToDom(blocksXml);
    if (clear) {
      Blockly.mainWorkspace.clear();
    }
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
  } catch (e) {
    alert("Failed to open Blockly program.");
    throw e;
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
  code = ["(function($$support) {", code, "})"].join("\n");
  //console.log(code);
  try {
    // The code actually returns the function from inside it, so call the eval
    // result immediately.
    aiFunction = eval(code)(new Support(app));
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

function windowResized() {
  var console = $('console');
  // We need 12 pixels presumably for the 1px border.
  // TODO Could look that up somehow?
  console.style.height =
    ($('app').clientHeight - console.offsetTop - 12) + "px";
}

function workspaceChanged() {
  // Let the user know they can recompile.
  $('update').disabled = false;
  // Also save immediately, although undo/redo would sure be nice.
  var xml = Blockly.Xml.domToText(
    Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)
  );
  window.localStorage.setItem(storageName('blocks'), xml);

  // Update the save link.
  // Chrome complained about security for xml, and default handlers for xml can
  // be bad anyway.
  // TODO Using percents and plainer text (not base64) might be nice.
  $a('save').href = "data:text/plain;base64," + btoa(xml);

  // Support export of current block, too.
  // TODO blockToDom_ is not public. Keep an eye on it!
  // TODO Further, it looks like it might be worth tweaking (x, y).
  // TODO See Blockly.Xml.workspaceToDom.
  var blockDom = Blockly.Xml.blockToDom_(Blockly.selected);
  // TODO Is the xml surrounding element really needed?
  var blockXml = "<xml>" + Blockly.Xml.domToText(blockDom) + "</xml>";
  // TODO Customize download name by block type/name.
  $a('export').href = "data:text/plain;base64," + btoa(blockXml);
}

}
