// data templates
// newPath = {
//   color: "",
//   stroke: "",
//   path: [],
//   resX: 3,
//   resY: 3,
// };

// state = {
//   paths: [],
//   shared: False,
//   color: "",
//   stroke: 3,
//   resX: 3,
//   resY: 3,
// };

// Extension globals
// use these to store the resolution needed for screen size changes
var documentHeight = document.documentElement.scrollHeight;
var documentWidth = window.innerWidth;

// Used to initialise if no data found
var placeholderState = {
  paths: [],
  shared: false,
  color: "green",
  stroke: 3,
  resX: documentHeight,
  resY: documentWidth,
};

// load a state if it exists if not use placeHolder
var extensionState = JSON.parse(localStorage.getItem("webdraw-extensionState"))
  ? JSON.parse(localStorage.getItem("webdraw-extensionState"))
  : placeholderState;
console.log("state of extension is, ", extensionState);

// temporary storage may not be needed?
var storedPaths = [];
var newPath = {};

// globals to allow use of canvas
var canvas;
var ctx;

// resizer will be called from onchange in res box and when layers are used
chrome.runtime.sendMessage(
  {
    action: "resizeWindow",
  },
  function (createdWindow) {
    console.log("Window Resize");
  }
);

// Add the transparent canvas to the webpage
function addTransparentCanvas() {
  // 1. Check if a canvas with the ID 'transparentOverlayCanvas' already exists
  let existingCanvas = document.getElementById("transparentOverlayCanvas");
  if (existingCanvas) {
    return;
  }

  // 2. Create canvas and allow global
  var canvas = document.createElement("canvas");
  canvas.id = "transparentOverlayCanvas";

  // 3. Set styling and position
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = documentWidth;
  canvas.style.height = documentHeight;
  canvas.style.zIndex = "10000000000"; // Ensure it's on top of other elements
  canvas.style.background = "transparent";
  canvas.style.pointerEvents = "auto"; // Make it interactive
  canvas.style.border = "1px solid red";
  canvas.style.overflow = "y-scroll";

  // 4. Append it to the DOM
  document.body.appendChild(canvas);

  // 5. Set the 2D rendering context as global
  var ctx = canvas.getContext("2d");
}

// create a draggable control element for settings/share etc
function createControls() {
  // 1. If it already exists from ON/OFF remove
  let controlsExists = document.getElementById("controls-box");
  controlsExists ? document.getElementById("controls-box").remove() : null;

  // 2. Create the controls element
  var controls = document.createElement("div");
  controls.id = "controls-box";

  // 3. Add innerHTML elements use class .controls to stop dragging on use
  // controls.insertAdjacentHTML("afterbegin", `<div> TEST HERE </div>`);
  injectHTMLFromFile("html/ui.html", "#controls-box");

  // 4. Set start position and styling
  controls.style.position = "fixed"; // Cover the entire viewport
  controls.style.top = "1vh";
  controls.style.left = "1vw";
  controls.style.zIndex = "10000000001"; // Ensure it's on top of other elements

  // 4. Append it to the DOM (usually the body)
  document.body.appendChild(controls);
  // setUpUIControls();
}

function setUpUIControls() {
  const minified = document.getElementById("webdraw-minified");
  const fullSize = document.getElementById("webdraw-full");
  const toggleButton = document.getElementById("toggle-button");

  minified.addEventListener("dblclick", () => {
    minified.classList.add("hidden");
    fullSize.classList.remove("hidden");
  });

  toggleButton.addEventListener("pointerdown", () => {
    fullSize.classList.add("hidden");
    minified.classList.remove("hidden");
  });

  const draggableImage = document.getElementById("webdraw-minified-image");

  if (draggableImage) {
    draggableImage.addEventListener("dragstart", (event) => {
      // Prevent the browser's default drag-and-drop behavior for this image
      event.preventDefault();

      // You can optionally add your custom drag logic here
      console.log("Custom drag started for the image.");
      // For example, you might want to store some data related to the dragged image:
      // event.dataTransfer.setData('text/plain', 'Image ID: my-draggable-image');
    });

    // You might also want to handle the 'dragend' event if you have custom cleanup
    draggableImage.addEventListener("dragend", (event) => {
      console.log("Custom drag ended for the image.");
      // Perform any cleanup or actions after the drag ends
    });
  } else {
    console.warn("Image with ID 'my-draggable-image' not found.");
  }
}
// Add listeners for drawing controls
function setupDrawingOnPointerDown() {
  console.log("drawing control added");
  canvas = document.getElementById("transparentOverlayCanvas");
  if (!canvas) {
    // console.error("Transparent canvas not found!");
    return;
  }
  // set up all canvas settings/data and variables to handle
  ctx = canvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  var newPath = {
    resX: extensionState.resX,
    resY: extensionState.resY,
    path: [],
  };

  function drawStoredPaths() {
    // check if there are stored paths to draw
    // storedPaths = JSON.parse(localStorage.getItem("storedPaths"));
    // use spread to shallow copy state data stored
    storedPaths = [...extensionState.paths];

    // redraw from state
    if (storedPaths.length > 0) {
      console.log("previous annotations found redrawing");
      console.log(storedPaths);

      storedPaths.forEach((path, index) => {
        // cycle through each path stored in storePaths
        ctx.beginPath();
        // get the res for each path
        let prevHeight = path.resX;
        let prevWidth = path.resY;
        let yTransform = documentHeight - prevHeight;
        let xTransform = documentWidth / prevWidth;
        // console.log(
        //   "transformation due to screen change ",
        //   xTransform,
        //   yTransform
        // );
        let coords = path.path.map(([x, y]) => [x * xTransform, y]);
        if (coords.length > 0) {
          ctx.moveTo(coords[0][0], coords[0][1]); // Move to the starting point

          for (let i = 1; i < coords.length; i++) {
            // Start from the second point
            const [x, y] = coords[i];
            ctx.lineTo(x, y); // Draw a line to the current point
          }
          ctx.strokeStyle = extensionState.color;
          ctx.lineWidth = extensionState.stroke;
          ctx.stroke();
          // ctx.closePath();
        } else {
          console.log("skipped blank path");
        }
      });
    } else {
      storedPaths = [];
    }
  }

  function startDrawing(e) {
    isDrawing = true;
    const offSetY = window.scrollY;
    [lastX, lastY] = [e.clientX, e.clientY + offSetY];
    console.log("starting draw ");
    // console.log([lastX, lastY]);
  }

  function drawLine(e) {
    if (!isDrawing) return;
    let offSetY = window.scrollY;

    // console.log("offset is", offSetY);
    // console.log("drawing at ", lastX, lastY);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.clientX, e.clientY + offSetY);
    ctx.strokeStyle = extensionState.color; // You can customize the color
    ctx.lineWidth = extensionState.stroke; // You can customize the line width
    ctx.stroke();
    [lastX, lastY] = [e.clientX, e.clientY + offSetY];
    // update the path object
    newPath.path.push([lastX, lastY]);
  }

  function stopDrawing() {
    isDrawing = false;
    // push drawings to a store?
    // console.log(newPath);
    storedPaths.push(newPath);
    newPath = {
      resX: extensionState.resX,
      resY: extensionState.resY,
      path: [],
    };
    console.log(storedPaths);
    // localStorage.setItem("storedPaths", JSON.stringify(storedPaths));

    // add new drawing to storage and save it to local storage

    // find all useless paths
    let toRemove = [];

    storedPaths.forEach((path, index) => {
      path.path.length == 0 ? toRemove.push(index) : null;
    });
    // go through and clean out
    for (let i = toRemove.length - 1; i >= 0; i--) {
      storedPaths.splice(toRemove[i], 1);
      extensionState.paths = [...storedPaths];
      localStorage.setItem("webdraw-extensionState", extensionState);
    }

    extensionState.paths = storedPaths;
    localStorage.setItem(
      "webdraw-extensionState",
      JSON.stringify(extensionState)
    );

    // if shared send state to db
  }

  // Add event listeners to the canvas
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", drawLine);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  setTimeout(() => drawStoredPaths(), 500);
}

// Call this function after the transparent canvas has been added to the DOM
function initializeExtension() {
  // 1. get an accurate measure of page
  documentHeight = document.documentElement.scrollHeight;

  // 2. Check if the canvas exists yet, if not, try again after a short delay
  const canvasCheckInterval = setInterval(() => {
    const canvas = document.getElementById("transparentOverlayCanvas");
    // If element is loaded then build it out
    if (canvas) {
      clearInterval(canvasCheckInterval);
      createControls();
      setupDrawingOnPointerDown();

      documentHeight = document.documentElement.scrollHeight;
      documentWidth = window.innerWidth;
      canvas.height = documentHeight;
      canvas.width = documentWidth;
      // set extension state's screen resX and resY to store required image data
      extensionState.resX = documentHeight;
      extensionState.resY = documentWidth;
    }
  }, 100);

  // Example usage: Inject 'my_template.html' into an element with the ID 'injection-point'
}

// inject the html ui
// content.js

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
      setUpUIControls();

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

// Add canvas called
addTransparentCanvas();
// Call the initialize function
initializeExtension();

// Listen for resize and rebuild extension to fit new dimensions
window.addEventListener("resize", () => {
  if (canvas) {
    canvas.remove();
    addTransparentCanvas();
    initializeExtension();
  }
});

// test the messaging function and listener system
// chrome.runtime.sendMessage({ message: "help" });
