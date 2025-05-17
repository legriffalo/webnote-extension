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
}

// Add canvas called
addTransparentCanvas();
// Call the initialize function
initializeExtension();
