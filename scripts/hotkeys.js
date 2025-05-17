// handle hotkeys for extension
// on keyboard call this function
function doc_keyUp(e) {
  extCommand = false;
  //   keyLog.splice(0, 1);
  //   keyLog.push(e.code);
  //   // clear out key log to stop spaced out presses triggering anything
  //   setTimeout(() => {
  //     keyLog = ["", ""];
  //   }, 500);

  // undo last doodle
  if (e.ctrlKey && e.shiftKey && e.code === "z") {
    extCommand = true;
    // insert code to undo
  }

  // decrease words per minute
  if (e.ctrlKey && e.shiftKey && e.code === "s") {
    extCommand = true;
    // save work to chrome extension storage and send to db if shared
  }
  // opening the help and controls
  if (e.ctrlKey && e.shiftKey && e.code === "KeyH") {
    extCommand = true;
    // open extension help
    chrome.runtime.sendMessage({ message: "help" });
  }

  // suppress OS defaults if an extension hotley is used
  if (extCommand) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// register the handler to doc Must be removed between instances
document.addEventListener("keydown", doc_keyUp, true);
