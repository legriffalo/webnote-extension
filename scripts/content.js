// need to get and set local Storage to preserve data
// also would allow sharign via server and API

// localStorage.setItem("extensionState", JSON.stringify(extensionState));
// extensionState = JSON.parse(localStorage.getItem("extensionState"));

// Extension state globals
var documentHeight;
var canvas;
var ctx;
var storedPaths = [];
var newPath = [];
var color = "blue";
var stroke = 6;

// Use to get updated vertical scroll height for webpage
// called on resize to get correct proportions
function getDocumentHeight() {
  return `${Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  )}px`;
}

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
  canvas.style.width = window.innerWidth;
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
  controls.insertAdjacentHTML("afterbegin", `<div> TEST HERE </div>`);

  // 4. Set start position and styling
  controls.style.position = "fixed"; // Cover the entire viewport
  controls.style.top = "1vh";
  controls.style.left = "1vw";
  controls.style.width = "10%";
  controls.style.height = "5%";
  controls.style.zIndex = "10000000001"; // Ensure it's on top of other elements
  controls.style.background = "grey";
  controls.style.border = "5px solid red";

  // 4. Append it to the DOM (usually the body)
  document.body.appendChild(controls);
}

// Add listeners for drawing controls
function setupDrawingOnPointerDown() {
  console.log("drawing control added");
  canvas = document.getElementById("transparentOverlayCanvas");
  if (!canvas) {
    console.error("Transparent canvas not found!");
    return;
  }
  // set up all canvas settings/data and variables to handle
  ctx = canvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  var newPath = [];

  function drawStoredPaths() {
    // check if there are stored paths to draw
    storedPaths = JSON.parse(localStorage.getItem("storedPaths"));
    console.log(storedPaths);
    // redraw from state
    if (storedPaths != null) {
      console.log("previous annotations found redrawing");
      console.log(storedPaths);

      storedPaths.forEach((path) => {
        // cycle through each path stored in storePaths
        ctx.beginPath();

        if (path.length > 0) {
          ctx.moveTo(path[0][0], path[0][1]); // Move to the starting point

          for (let i = 1; i < path.length; i++) {
            // Start from the second point
            const [x, y] = path[i];
            ctx.lineTo(x, y); // Draw a line to the current point
          }
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 3;
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
    ctx.strokeStyle = color; // You can customize the color
    ctx.lineWidth = stroke; // You can customize the line width
    ctx.stroke();
    [lastX, lastY] = [e.clientX, e.clientY + offSetY];
    newPath.push([lastX, lastY]);
  }

  function stopDrawing() {
    isDrawing = false;
    // push drawings to a store?
    console.log(newPath);
    storedPaths.push(newPath);
    newPath = [];
    console.log(storedPaths);
    localStorage.setItem("storedPaths", JSON.stringify(storedPaths));
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
  documentHeight = getDocumentHeight();

  // 2. Check if the canvas exists yet, if not, try again after a short delay
  const canvasCheckInterval = setInterval(() => {
    createControls();
    const canvas = document.getElementById("transparentOverlayCanvas");
    // If element is loaded then build it out
    if (canvas) {
      clearInterval(canvasCheckInterval);
      setupDrawingOnPointerDown();
      documentHeight = document.documentElement.scrollHeight; // Try this first
      canvas.height = documentHeight;
      canvas.width = window.innerWidth;
    }
  }, 100);
}

// Add canvas called
addTransparentCanvas();
// Call the initialize function
initializeExtension();

// You might still want to keep the resize listener from the previous example
window.addEventListener("resize", () => {
  if (canvas) {
    document.getElementById("transparentOverlayCanvas").remove();
    addTransparentCanvas();
    initializeExtension();

    // documentHeight = getDocumentHeight();
    // console.log("recalculated required height", documentHeight);
    // canvas.width = window.innerWidth;
    // canvas.height = documentHeight;

    // // **Crucially, get the context again after resizing**
    // ctx = canvas.getContext("2d");

    // // **Redraw your content here if needed**
    // // Example:
    // // if (yourDrawingData) {
    // //   redrawCanvas(ctx, yourDrawingData, canvas.width, canvas.height);
    // // }
  }
});
