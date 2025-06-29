// This code handles the injection and rendering of the
// UI elements for the application functions in this file
// are called from the content.js file
let webdrawShadowRoot = null;
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
    // TODO: need to make it select from shadowRoot
    const targetElement = webdrawShadowRoot.querySelector(targetSelector);
    // If needed this may be the best place to attach a shadow DOM
    if (targetElement) {
      // inject all html into element
      targetElement.innerHTML += htmlContent;
      // call to add listeners

      const localImage = targetElement.querySelector("#webdraw-minified-image");
      if (localImage) {
        localImage.src = chrome.runtime.getURL("./images/icon48.png");
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
  // 1. If extension root already exists then remove it
  let extExists = document.getElementById("webdraw-extensionRoot");
  extExists ? document.getElementById("webdraw-extensionRoot").remove() : null;

  // 2. If main child exusts remove
  //TODO: this can probably just be removed we'll see
  let controlsExists = document.getElementById("webdraw-controls-box");
  controlsExists
    ? document.getElementById("webdraw-controls-box").remove()
    : null;

  // 2. Create the root for the shadow DOM
  var extensionHost = document.createElement("div");
  extensionHost.id = "webdraw-extensionRoot";
  document.body.appendChild(extensionHost); // Append it to the body or a specific target

  // // 3. Create a style element and append your compiled CSS content to it
  // const styleElement = document.createElement("style");

  // // 3. add a container element to inject HTML content in to
  // const controls = document.createElement("div");
  // controls.id = "webdraw-controls-box"; // Give it a unique ID

  //TODO: fix all of this!!!!!!
  // 3. Create a shadow DOM for dynamically created elements to be appended
  var webdrawShadowRoot = extensionHost.attachShadow({ mode: "open" }); // 'open' allows JS access from outside

  // 4. Fetch and append CSS
  try {
    const cssResponse = await fetch(chrome.runtime.getURL("./css/output.css"));
    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch CSS: ${cssResponse.status}`);
    }
    const cssContent = await cssResponse.text();
    console.log("loaded css"); // No need to log the entire CSS content here

    const styleElement = document.createElement("style");
    styleElement.textContent = cssContent;
    webdrawShadowRoot.appendChild(styleElement);

    // 5. Add the main container element for your UI within the shadow DOM
    const controls = document.createElement("div");
    controls.id = "controls-box"; // Use the ID from your CSS, was 'webdraw-controls-box' in old code, but your CSS uses '#controls-box'
    // Ensure consistency: if CSS is #controls-box, HTML should be id="controls-box"
    webdrawShadowRoot.appendChild(controls);

    // 6. Inject main UI HTML (ui.html) into controls
    // Pass globalShadowRoot to the utility function
    await injectHTMLFromFile(
      webdrawShadowRoot,
      "./html/ui.html",
      "#controls-box"
    ); // Target the div *inside* shadowRoot

    // 7. Inject layers data (layer.html) - THIS MUST WAIT for ui.html to be loaded!
    // Assuming #webdraw-layers-table is inside ui.html, this will now work.
    await injectHTMLFromFile(
      webdrawShadowRoot,
      "./html/layer.html",
      "#webdraw-layers-table"
    );

    // 8. Set up UI controls after all HTML is injected
    // Pass shadowRoot to setUpUIControls if it needs to query elements
    // Also ensure setUpUIControls is defined and handles elements within shadowRoot
    setUpUIControls(webdrawShadowRoot); // Call directly without setTimeout after async operations
    console.log("UI Controls setup complete.");
  } catch (error) {
    console.error("Error setting up extension UI:", error);
  }
}

//   fetch(chrome.runtime.getURL("./css/output.css"))
//     .then((response) => response.text())
//     .then((css) => {
//       console.log("loaded css", css);
//       styleElement.textContent = css;
//       shadowRoot.appendChild(styleElement);
//       shadowRoot.appendChild(controls);

//       // 4. Add innerHTML elements use class .controls to stop dragging on use
//       // controls.insertAdjacentHTML("afterbegin", `<div> TEST HERE </div>`);
//       injectHTMLFromFile("./html/ui.html", "#webdraw-controls-box");
//       // add layers data to layer view through repeated injection of the layer.html
//       injectHTMLFromFile("./html/layer.html", "#webdraw-layers-table");
//     });
//   // 4. Set start position and styling
//   // controls.style.position = "fixed"; // Cover the entire viewport
//   // controls.style.top = "1vh";
//   // controls.style.left = "1vw";
//   // controls.style.zIndex = "10000000001"; // Ensure it's on top of other elements

//   // 4. Append it to the DOM (usually the body)
//   // document.body.appendChild(controls);
//   setTimeout(() => {
//     setUpUIControls();
//   }, 300);
// }

// Example setUpUIControls - ensure it uses the passed shadowRoot
function setUpUIControls(shadowRoot) {
  if (!shadowRoot) {
    console.error("setUpUIControls: shadowRoot not provided.");
    return;
  }
  // Now you can safely select elements like this:
  const header = shadowRoot.querySelector("#header");
  if (header) {
    console.log("Header element found for UI controls setup!");
    // Add event listeners, etc.
  } else {
    console.warn("Header not found during UI controls setup.");
  }

  // Example of adding draggable functionality to the #controls-box
  const controlsBox = shadowRoot.querySelector("#controls-box");
  if (controlsBox) {
    // Implement your draggable logic here, attaching listeners to controlsBox
    // For example:
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    controlsBox.addEventListener("mousedown", (e) => {
      // Check if the click is on an element that should not drag the box
      if (e.target.closest(".no-drag")) {
        // Add a class 'no-drag' to buttons, inputs etc.
        return;
      }
      isDragging = true;
      offset = {
        x: e.clientX - controlsBox.getBoundingClientRect().left,
        y: e.clientY - controlsBox.getBoundingClientRect().top,
      };
      controlsBox.style.cursor = "grabbing";
      e.preventDefault(); // Prevent text selection etc.
    });

    shadowRoot.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      controlsBox.style.left = `${e.clientX - offset.x}px`;
      controlsBox.style.top = `${e.clientY - offset.y}px`;
    });

    shadowRoot.addEventListener("mouseup", () => {
      isDragging = false;
      controlsBox.style.cursor = "grab";
    });

    // Ensure the box is positioned for dragging
    controlsBox.style.position = "fixed";
    controlsBox.style.top = "1vh";
    controlsBox.style.left = "1vw";
    controlsBox.style.zIndex = "10000000001"; // Ensure it's on top
    controlsBox.style.cursor = "grab";
  }
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
  const deleteButton = document.getElementById("webdraw-delete-button");
  const shareButton = document.getElementById("webdraw-share-button");
  const saveButton = document.getElementById("webdraw-save-button");

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
    deleteDrawings();
  });

  shareButton.addEventListener("pointerdown", () => {
    shareToServer();
  });

  saveButton.addEventListener("pointerdown", () => {
    saveLocally();
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
