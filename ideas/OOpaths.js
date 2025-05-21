class Path {
  /**
   * Represents a single drawing path.
   */
  constructor(color, stroke, resX, resY) {
    /**
     * The color of the path.
     * @type {string}
     */
    this.color = color;
    /**
     * The stroke width of the path.
     * @type {number}
     */
    this.stroke = stroke;
    /**
     * Array to store the path coordinates as [x, y] pairs.
     * @type {Array<Array<number>>}
     */
    this.path = [];
    /**
     * The document height when the path started being drawn.
     * @type {number}
     */
    this.resX = resX;
    /**
     * The document width when the path started being drawn.
     * @type {number}
     */
    this.resY = resY;
  }

  /**
   * Records a new point in the path.
   * @param {number} x - The x-coordinate of the point.
   * @param {number} y - The y-coordinate of the point.
   */
  addPoint(x, y) {
    this.path.push([x, y]);
  }

  /**
   * Gets the transformed path coordinates based on the current screen dimensions.
   * @param {number} currentHeight - The current document height.
   * @param {number} currentWidth - The current window width.
   * @returns {Array<Array<number>>} A new list of transformed coordinate pairs.
   */
  getTransformedPath(currentHeight, currentWidth) {
    if (!this.path) {
      return [];
    }

    const yTransform = this.resX !== 0 ? currentHeight / this.resX : 1;
    const xTransform = this.resY !== 0 ? currentWidth / this.resY : 1;

    const transformedPath = this.path.map(([x, y]) => [
      x * xTransform,
      y * yTransform,
    ]);
    return transformedPath;
  }

  /**
   * Draws the path on the given canvas context.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
   * @param {number} currentHeight - The current document height for transformation.
   * @param {number} currentWidth - The current window width for transformation.
   */
  draw(ctx, currentHeight, currentWidth) {
    const transformedPath = this.getTransformedPath(
      currentHeight,
      currentWidth
    );
    if (transformedPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(transformedPath[0][0], transformedPath[0][1]);
      for (let i = 1; i < transformedPath.length; i++) {
        const [x, y] = transformedPath[i];
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.stroke;
      ctx.stroke();
    }
  }

  /**
   * Returns a string representation of the Path object.
   * @returns {string}
   */
  toString() {
    return `Path(color='${this.color}', stroke=${this.stroke}, path_length=${this.path.length}, resX=${this.resX}, resY=${this.resY})`;
  }
}

class Layer {
  /**
   * Represents a layer containing multiple drawing paths.
   */
  constructor(name = "default") {
    /**
     * The name of the layer.
     * @type {string}
     */
    this.name = name;
    /**
     * Array to store the Path objects in this layer.
     * @type {Array<Path>}
     */
    this.paths = [];
  }

  /**
   * Adds a Path object to the layer.
   * @param {Path} path - The Path object to add.
   * @throws {TypeError} If the provided argument is not a Path object.
   */
  addPath(path) {
    if (path instanceof Path) {
      this.paths.push(path);
    } else {
      throw new TypeError("Must provide a Path object to add_path.");
    }
  }

  /**
   * Gets all the Path objects in the layer.
   * @returns {Array<Path>} A list of Path objects.
   */
  getPaths() {
    return this.paths;
  }

  /**
   * Clears all paths from the layer.
   */
  clear() {
    this.paths = [];
  }

  /**
   * Returns a string representation of the Layer object.
   * @returns {string}
   */
  toString() {
    return `Layer(name='${this.name}', path_count=${this.paths.length})`;
  }
}

// Utility functions for converting to/from plain objects for localStorage
function pathToObject(path) {
  return {
    color: path.color,
    stroke: path.stroke,
    path: path.path,
    resX: path.resX,
    resY: path.resY,
  };
}

function objectToPath(obj) {
  const path = new Path(obj.color, obj.stroke, obj.resX, obj.resY);
  path.path = obj.path; // Manually assign the path data
  return path;
}

function layerToObject(layer) {
  return {
    name: layer.name,
    paths: layer.paths.map(pathToObject),
  };
}

function objectToLayer(obj) {
  const layer = new Layer(obj.name);
  layer.paths = obj.paths.map(objectToPath);
  return layer;
}

// Extension globals
var documentHeight = document.documentElement.scrollHeight;
var documentWidth = window.innerWidth;

// Used to initialise if no data found
var placeholderState = {
  paths: [], // Will store Layer objects (as JSON)
  shared: false,
  color: "green",
  stroke: 3,
  resX: documentHeight,
  resY: documentWidth,
};

// load a state if it exists if not use placeHolder
var extensionState =
  JSON.parse(localStorage.getItem("webdraw-extensionState")) ||
  placeholderState;

// Ensure extensionState.paths is an array
if (!Array.isArray(extensionState.paths)) {
  extensionState.paths = [];
}

console.log("state of extension is, ", extensionState);

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
  let existingCanvas = document.getElementById("transparentOverlayCanvas");
  if (existingCanvas) {
    return;
  }

  canvas = document.createElement("canvas");
  canvas.id = "transparentOverlayCanvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = documentWidth + "px";
  canvas.style.height = documentHeight + "px";
  canvas.style.zIndex = "10000000000";
  canvas.style.background = "transparent";
  canvas.style.pointerEvents = "auto";
  canvas.style.border = "1px solid red";
  canvas.style.overflow = "y-scroll";

  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
}

// Add listeners for drawing controls
function setupDrawingOnPointerDown() {
  console.log("drawing control added");
  canvas = document.getElementById("transparentOverlayCanvas");
  if (!canvas) {
    return;
  }
  ctx = canvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentPath = null; // To store the current Path object being drawn

  function drawStoredPaths() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    extensionState.paths.forEach((layerData) => {
      const layer = objectToLayer(layerData);
      layer.getPaths().forEach((path) => {
        path.draw(ctx, documentHeight, documentWidth); // Use the Path's draw method
      });
    });
  }

  function startDrawing(e) {
    isDrawing = true;
    const offSetY = window.scrollY;
    [lastX, lastY] = [e.clientX, e.clientY + offSetY];
    currentPath = new Path(
      extensionState.color,
      extensionState.stroke,
      documentHeight,
      documentWidth
    );
    currentPath.addPoint(lastX, lastY); // Add the starting point
  }

  function drawLine(e) {
    if (!isDrawing || !currentPath) return;
    let offSetY = window.scrollY;
    const newX = e.clientX;
    const newY = e.clientY + offSetY;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(newX, newY);
    ctx.strokeStyle = currentPath.color;
    ctx.lineWidth = currentPath.stroke;
    ctx.stroke();

    currentPath.addPoint(newX, newY); // Record the new point in the path
    [lastX, lastY] = [newX, newY];
  }

  function stopDrawing() {
    isDrawing = false;
    if (currentPath && currentPath.path.length > 1) {
      let currentLayer;
      if (extensionState.paths.length > 0) {
        const lastLayerData =
          extensionState.paths[extensionState.paths.length - 1];
        currentLayer = objectToLayer(lastLayerData);
      } else {
        currentLayer = new Layer("default");
        extensionState.paths.push(layerToObject(currentLayer));
      }
      currentLayer.addPath(currentPath);
      extensionState.paths[extensionState.paths.length - 1] =
        layerToObject(currentLayer);
      localStorage.setItem(
        "webdraw-extensionState",
        JSON.stringify(extensionState)
      );
    }
    currentPath = null; // Reset the current path
  }

  // Add event listeners to the canvas
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", drawLine);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  setTimeout(drawStoredPaths, 500);
}

// Call this function after the transparent canvas has been added to the DOM
function initializeExtension() {
  documentHeight = document.documentElement.scrollHeight;
  documentWidth = window.innerWidth;

  const canvasCheckInterval = setInterval(() => {
    const canvas = document.getElementById("transparentOverlayCanvas");
    if (canvas) {
      clearInterval(canvasCheckInterval);
      // Assuming createControls is defined elsewhere
      if (typeof createControls === "function") {
        createControls();
      }
      setupDrawingOnPointerDown();

      documentHeight = document.documentElement.scrollHeight;
      documentWidth = window.innerWidth;
      canvas.height = documentHeight;
      canvas.width = documentWidth;
      extensionState.resX = documentHeight;
      extensionState.resY = documentWidth;
    }
  }, 100);
}

// Add canvas called
addTransparentCanvas();
// Call the initialize function
initializeExtension();
