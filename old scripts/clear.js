// Whenever the extension is closed this script is called to
// ensure that all processes started by the extension have stopped
// remove the popup element

console.log("clearance script called");

// const minified = document.getElementById("webdraw-minified");
// const fullSize = document.getElementById("webdraw-full");
// const toggleButton = document.getElementById("webdraw-toggle-button");
// const helpButton = document.getElementById("webdraw-help-button");

document.getElementById("webdraw-toggle-button").remove();
document.getElementById("webdraw-help-button").remove();
document.getElementById("webdraw-minified").remove();
document.getElementById("webdraw-full").remove();

document.getElementById("transparentOverlayCanvas").remove();
document.getElementById("controls-box").remove();
document.removeEventListener("pointerup", detectDoubleTap(500));
document.removeEventListener("keydown", doc_keyUp, true);
