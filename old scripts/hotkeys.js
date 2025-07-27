// handle hotkeys for extension
// on keyboard call this function
function doc_keyUp(e) {
  extCommand = false;

  // undo last doodle
  if (e.ctrlKey && e.shiftKey && e.code === "z") {
    extCommand = true;
    // insert code to undo last doodle
    // delete last item in paths and then re-initialise canvas
  }

  // decrease words per minute
  if (e.ctrlKey && e.shiftKey && e.code === "s") {
    extCommand = true;
    // save work to chrome extension storage and send to db if shared
    //using chrome extension storage hsould allow cross device useage
    // as long as internet connection is available
  }

  // opening the help and controls
  if (e.ctrlKey && e.shiftKey && e.code === "KeyH") {
    extCommand = true;
    // open extension help
    chrome.runtime.sendMessage({ message: "help" });
  }

  // suppress OS defaults if an extension hotkey is used
  if (extCommand) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// register the handler to doc, Must be removed between instances
document.addEventListener("keydown", doc_keyUp, true);
