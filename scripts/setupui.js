// utility function to inject html objects into ui
// Added an optional cssFilePaths parameter
async function injectHTMLFromFile(
  hostElement,
  htmlFilePath,
  targetSelector,
  cssFilePaths = []
) {
  try {
    let shadowRoot = hostElement.shadowRoot;
    if (!shadowRoot) {
      shadowRoot = hostElement.attachShadow({ mode: "open" });
      console.log("Shadow DOM attached to:", hostElement);
    }

    const response = await fetch(chrome.runtime.getURL(htmlFilePath));
    if (!response.ok) {
      console.error(`Failed to fetch HTML file: ${response.status}`);
      return;
    }
    const htmlContent = await response.text();

    // Inject the fetched HTML content directly into the shadowRoot
    shadowRoot.innerHTML = htmlContent;

    // --- NEW: Load external CSS files ---
    for (const cssPath of cssFilePaths) {
      const linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "stylesheet");
      // Use chrome.runtime.getURL to resolve the path for the CSS file
      linkElement.setAttribute("href", chrome.runtime.getURL(cssPath));
      shadowRoot.appendChild(linkElement);
      console.log(`CSS file loaded into Shadow DOM: ${cssPath}`);
    }
    // --- END NEW ---

    const targetElement = shadowRoot.querySelector(targetSelector);

    if (targetElement) {
      console.log(`Target element "${targetSelector}" found in Shadow DOM.`);
      const localImage = shadowRoot.querySelector("#webdraw-minified-image");
      if (localImage) {
        localImage.src = chrome.runtime.getURL("./images/icon48.png");
        console.log("Image source updated in Shadow DOM.");
      }
    } else {
      console.warn(
        `Target element "${targetSelector}" not found in Shadow DOM.`
      );
    }
  } catch (error) {
    console.error("Error fetching or injecting HTML into Shadow DOM:", error);
  }
}

// --- Example Usage ---
var myShadowHost = document.createElement("div");
myShadowHost.id = "shadow-dom-webdraw";
document.body.appendChild(myShadowHost); // Add it to the main document body

var draggable_ui = new Draggable(myShadowHost); // encapsulate ui in draggable box

// Call with the HTML file (without the <link> tag) and the CSS file path
injectHTMLFromFile(
  myShadowHost,
  "html/ui.html",
  "#webdraw-full",
  ["css/output.css"] // Pass the CSS file path(s) here
)
  .then(() => {
    console.log("Doodle UI and its styles loaded into Shadow DOM.");
    const shadowRoot = myShadowHost.shadowRoot;
    if (shadowRoot) {
      const activateButton = shadowRoot.querySelector("#save-button");
      if (activateButton) {
        activateButton.addEventListener("click", () => {
          alert("Save button clicked!");
        });
      }
      // add listeners to shadow dom elements

      // Add listeners to the elements in the core UI
      const minified = shadowRoot.querySelector("#webdraw-minified");
      const fullSize = shadowRoot.querySelector("#webdraw-full");
      const toggleButton = shadowRoot.querySelector("#webdraw-toggle-button");
      const helpButton = shadowRoot.querySelector("#webdraw-help-button");
      const colorPicker = shadowRoot.querySelector("#webdraw-color-picker");
      const thicknessSlider = shadowRoot.querySelector(
        "#webdraw-thickness-slider"
      );
      const opacitySlider = shadowRoot.querySelector("#webdraw-opacity-slider");
      const deleteButton = shadowRoot.querySelector("#delete-button");
      const shareButton = shadowRoot.querySelector("#share-button");
      const saveButton = shadowRoot.querySelector("#save-button");

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
        console.log(extensionState);
      });

      thicknessSlider.addEventListener("change", () => {
        extensionState.stroke = thicknessSlider.value;
        shadowRoot.getElementById("webdraw-thickness-value").textContent =
          thicknessSlider.value;
      });

      opacitySlider.addEventListener("change", () => {
        extensionState.opacity = opacitySlider.value;
        shadowRoot.getElementById("webdraw-opacity-value").textContent =
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

      // Make the minified UI be draggable without issues
      // Replaced document.getElementById with shadowRoot.getElementById
      const draggableImage = shadowRoot.getElementById(
        "webdraw-minified-image"
      );

      if (draggableImage) {
        draggableImage.addEventListener("dragstart", (event) => {
          // Prevent the browser's default drag-and-drop behavior for this image
          event.preventDefault();
        });
      } else {
        console.warn("Image with ID 'my-draggable-image' not found.");
      }
    }
  })
  .catch((error) => {
    console.error("Failed to load Doodle UI:", error);
  });
