// content.js - This script will be injected into the webpage

function addTransparentCanvas() {
  // Check if a canvas with the ID 'transparentOverlayCanvas' already exists
  let existingCanvas = document.getElementById("transparentOverlayCanvas");
  if (existingCanvas) {
    return; // Don't add another one
  }

  // 1. Create the canvas element
  const canvas = document.createElement("canvas");
  canvas.id = "transparentOverlayCanvas";

  // 2. Set its position and styling
  canvas.style.position = "fixed"; // Cover the entire viewport
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none"; // Allow interaction with elements underneath
  canvas.style.zIndex = "1000"; // Ensure it's on top of other elements
  canvas.style.background = "transparent";
  canvas.style.pointerEvents = "auto"; // Make it interactive

  // 3. Append it to the DOM (usually the body)
  document.body.appendChild(canvas);

  // Get the 2D rendering context
  const ctx = canvas.getContext("2d");
}

function setupDrawingOnPointerDown() {
  console.log("drawing control added");
  const canvas = document.getElementById("transparentOverlayCanvas");
  if (!canvas) {
    console.error("Transparent canvas not found!");
    return;
  }
  const ctx = canvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.clientX, e.clientY];
    console.log("starting draw ");
  }

  function drawLine(e) {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.clientX, e.clientY);
    ctx.strokeStyle = "red"; // You can customize the color
    ctx.lineWidth = 3; // You can customize the line width
    ctx.stroke();
    [lastX, lastY] = [e.clientX, e.clientY];
  }

  function stopDrawing() {
    isDrawing = false;
  }

  // Add event listeners to the canvas
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", drawLine);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);
}

// Call this function after the transparent canvas has been added to the DOM
function initializeExtension() {
  // Check if the canvas exists yet, if not, try again after a short delay
  const canvasCheckInterval = setInterval(() => {
    const canvas = document.getElementById("transparentOverlayCanvas");
    if (canvas) {
      clearInterval(canvasCheckInterval);
      setupDrawingOnPointerDown();
      // Optionally, you might want to resize the canvas on load as well
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, 100); // Check every 100 milliseconds
}

addTransparentCanvas();

// // Call the initialize function
initializeExtension();

// You might still want to keep the resize listener from the previous example
window.addEventListener("resize", () => {
  const canvas = document.getElementById("transparentOverlayCanvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    // You might need to redraw the existing content on resize if needed
    // For a simple drawing app, you might not need to redraw everything
  }
});

console.log("extension loaded");
