// TODO Replace with Typescript code!

(function() {

window.onload = function() {
  // TODO Support telling mario where to load things!
  new Enjine.Application().Initialize(
    new Mario.LoadingState("mario/"), 320, 240
  );
  Blockly.inject($('blockly'), {path: "blockly/", toolbox: $('toolbox')});
};

function $(id) {
  return document.getElementById(id);
}

})();
