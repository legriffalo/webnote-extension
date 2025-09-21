console.log("Utilities script loaded");
// Utility function to provide a listener for double tap events
function detectDoubleTap(doubleTapMs) {
  let timeout,
    lastTap = 0;
  return function detectDoubleTap(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (0 < tapLength && tapLength < doubleTapMs) {
      event.preventDefault();
      const doubleTap = new CustomEvent("doubletap", {
        bubbles: true,
        detail: event,
      });
      event.target.dispatchEvent(doubleTap);
    } else {
      timeout = setTimeout(() => clearTimeout(timeout), doubleTapMs);
    }
    lastTap = currentTime;
  };
}

// initialize double tap listener
// this shoudl potentially move ot another file for maintainability
// const minified = shadowRoot.querySelector("#webdraw-minified");

shadowHost = document.getElementById("shadow-dom-webdraw");
// shadowRoot = addEventListener("click", () => {
//   alert("egg");
// });
shadowHost.shadowRoot.addEventListener("pointerup", detectDoubleTap(300));
