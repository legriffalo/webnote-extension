// This code handles the injection and rendering of the
// UI elements for the application functions in this file
// are called from the content.js file

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
document.addEventListener("pointerup", detectDoubleTap(300));

//utility function ot inject html objects in to ui
async function injectHTMLFromFile(htmlFilePath, targetSelector) {
  try {
    const response = await fetch(chrome.runtime.getURL(htmlFilePath));
    if (!response.ok) {
      console.error(`Failed to fetch HTML file: ${response.status}`);
      return;
    }
    const htmlContent = await response.text();
    const targetElement = document.querySelector(targetSelector);

    if (targetElement) {
      // inject all html into element
      targetElement.innerHTML = htmlContent;
      // call to add listeners

      const localImage = targetElement.querySelector("#webdraw-minified-image");
      if (localImage) {
        localImage.src = chrome.runtime.getURL("images/icon48.png");
        console.log("image loading");
      }
    } else {
      console.warn(`Target element "${targetSelector}" not found.`);
    }
  } catch (error) {
    console.error("Error fetching or injecting HTML:", error);
  }
}

// Called to create a draggable control element for settings/share etc
// called whenever intitialise is called in main file
async function createControls() {
  // 1. If it already exists from ON/OFF remove
  let controlsExists = document.getElementById("controls-box");
  controlsExists ? document.getElementById("controls-box").remove() : null;

  // 2. Create the controls element
  var controls = document.createElement("div");
  controls.id = "controls-box";

  // 3. Add innerHTML elements use class .controls to stop dragging on use
  // controls.insertAdjacentHTML("afterbegin", `<div> TEST HERE </div>`);
  injectHTMLFromFile("html/ui.html", "#controls-box");

  // add layers data to layer view through repeated injection of the layer.html
  injectHTMLFromFile("html/layer.html", "#webdraw-layers-table");

  // 4. Set start position and styling
  controls.style.position = "fixed"; // Cover the entire viewport
  controls.style.top = "1vh";
  controls.style.left = "1vw";
  controls.style.zIndex = "10000000001"; // Ensure it's on top of other elements

  // 4. Append it to the DOM (usually the body)
  document.body.appendChild(controls);
  setTimeout(() => {
    setUpUIControls();
  }, 300);
}

// Adding all the required listeners to the UI
function setUpUIControls() {
  // add listeners to the elements in the core ui
  const minified = document.getElementById("webdraw-minified");
  const fullSize = document.getElementById("webdraw-full");
  const toggleButton = document.getElementById("webdraw-toggle-button");
  const helpButton = document.getElementById("webdraw-help-button");
  const colorPicker = document.getElementById("webdraw-color-picker");
  const thicknessSlider = document.getElementById("webdraw-thickness-slider");
  const opacitySlider = document.getElementById("webdraw-opacity-slider");
  const deleteButton = document.getElementById("delete-button");
  const shareButton = document.getElementById("delete-button");
  const saveButton = document.getElementById("delete-button");

  minified.addEventListener("doubletap", () => {
    minified.classList.add("hidden");
    fullSize.classList.remove("hidden");
  });

  toggleButton.addEventListener("click", () => {
    console.log("toggle clicked");
    fullSize.classList.add("hidden");
    minified.classList.remove("hidden");
  });

  helpButton.addEventListener("click", () => {
    console.log("help clicked ");
    chrome.runtime.sendMessage({ message: "help" });
  });

  colorPicker.addEventListener("change", () => {
    extensionState.color = colorPicker.value;
  });

  thicknessSlider.addEventListener("change", () => {
    extensionState.stroke = thicknessSlider.value;
    document.getElementById("webdraw-thickness-value").textContent =
      thicknessSlider.value;
  });

  opacitySlider.addEventListener("change", () => {
    extensionState.opacity = opacitySlider.value;
    document.getElementById("webdraw-opacity-value").textContent =
      opacitySlider.value;
  });

  deleteButton.addEventListener("pointerdown", () => {
    console.log("delete called");
  });

  shareButton.addEventListener("pointerdown", () => {
    console.log("share called");
  });

  saveButton.addEventListener("pointerdown", () => {
    console.log("save called");
  });

  // make the miinified ui be draggable without issues
  const draggableImage = document.getElementById("webdraw-minified-image");

  if (draggableImage) {
    draggableImage.addEventListener("dragstart", (event) => {
      // Prevent the browser's default drag-and-drop behavior for this image
      event.preventDefault();
    });
  } else {
    console.warn("Image with ID 'my-draggable-image' not found.");
  }
}
