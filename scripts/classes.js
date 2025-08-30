class Path {
  /* 
::DESCRIPTION::
This class handles basic drawing functions

::ATTRIBUTES::
color - string storing hex code for color selected 
opcacity - integer 0.1-1 that stores the opcacity of the path
weight - 0.1 - 10 Thickness of the line  
parentLayer - The id of the layer object this path belongs to 
coords - an array of 2d arrays that stores the coordinates of the path 

::METHODS::
addCoords - adds a new coordinate to the path 
drawPath - render the path 
serialise - transforms this class in to a string representation to allow for storage
deserialise - reconstitutes the class from storage string (redraws)
*/
  // class DoodleManager {
  //     constructor(canvasElement) {
  //         this.canvas = canvasElement;
  //         this.ctx = canvasElement.getContext('2d');
  //         this.doodles = [];
  //         this.isDrawing = false;
  //         // Bind event handlers to the class instance
  //         this._onMouseDown = this._onMouseDown.bind(this);
  //         this._onMouseMove = this._onMouseMove.bind(this);
  //         this._onMouseUp = this._onMouseUp.bind(this);
  //         this._onResize = this._onResize.bind(this); // For canvas resizing
  //         this.addListeners();
  //     }
  //     addListeners() {
  //         this.canvas.addEventListener('mousedown', this._onMouseDown);
  //         this.canvas.addEventListener('mousemove', this._onMouseMove);
  //         window.addEventListener('mouseup', this._onMouseUp); // Listen globally for mouse up
  //         window.addEventListener('resize', this._onResize);
  //     }
  //     removeListeners() {
  //         this.canvas.removeEventListener('mousedown', this._onMouseDown);
  //         this.canvas.removeEventListener('mousemove', this._onMouseMove);
  //         window.removeEventListener('mouseup', this._onMouseUp);
  //         window.removeEventListener('resize', this._onResize);
  //     }
  //     _onMouseDown(e) {
  //         this.isDrawing = true;
  //         // Start a new doodle, record initial point
  //         // ...
  //     }
  //     _onMouseMove(e) {
  //         if (!this.isDrawing) return;
  //         // Add points to current doodle
  //         // ...
  //     }
  //     _onMouseUp(e) {
  //         this.isDrawing = false;
  //         // Finalize doodle
  //         // ...
  //     }
  //     _onResize() {
  //         // Adjust canvas size, redraw doodles
  //         // ...
  //     }
  //     // Other methods for managing doodle data (add, remove, serialize, etc.)
  //     addDoodle(doodleData) { /* ... */ }
  //     getDoodles() { /* ... */ }
  // }
  //   constructor(color, opacity, weight, canvas) {
  //     //@type {string}
  //     this.color = color;
  //     //@type {number}
  //     this.opacity = opacity;
  //     //@type {number}
  //     this.weight = weight;
  //     //@type {htmlm obj by id}
  //     this.canvas = canvas;
  //     //@type {Array<Array<number>>}
  //     this.path = [];
  //   }
  //   // store coords
  //   addCoords(x, y) {
  //     this.path.push([x, y]);
  //   }
  //   drawPath() {
  //     // may be better to access as a listener
  //   }
}

class Layer {
  /* 
::DESCRIPTION::
Layer objects store multiple paths and controls how these are shared on the platform

::ATTRIBUTES::
resX - integer The width that is set by user (locked to maintain consistency across shares)
resY - integer The height of the screen (locked to ensure consistency)
shared - boolean (is this view shared anywhere)
layerid - string unique id string

::METHODS::
addPath - Add a serialised path to the paths attr
removePath - Remove the last path from the paths attr
serialiser - serialise the layer for storage 
store - set the basic localStorage state variable to preserve changes ( will porbbably call anytime paths changes)
***** True storage through SQL/chrome account storage will be accessed form main session *****
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
}

class Session {
  /* 
::DESCRIPTION::
A class to handle all layers and paths available as well as saves etc

::ATTRIBUTES::
layers - an array of layers to be shown

::METHODS::
addCoordinates - adds a new coordinate to the path 
*/
}

class Draggable {
  /* ::DESCRIPTION::
Takes an HTML element and turns it into a draggable element

::ATTRIBUTES::
element - Element to apply the draggable properties to 

::METHODS:: */

  constructor(element) {
    this.element = element;
    this.scrollbarWidth = window.innerWidth - document.body.offsetWidth;
    this.diff = {};

    // Use arrow functions to maintain the correct 'this' context
    // This allows us to access `this.calcDiff`, `this.handleMouseMove`, etc.
    this.element.addEventListener("touchstart", (e) => {
      if (!this.controls(e)) {
        e.preventDefault();

        this.calcDiff(e.touches[0].clientX, e.touches[0].clientY);
        // Add listener to the window for continuous tracking
        window.addEventListener("pointermove", this.handleMouseMove);
      }
    });

    this.element.addEventListener("mousedown", (e) => {
      if (!this.controls(e)) {
        e.preventDefault(); // Prevents default browser drag behavior

        this.calcDiff(e.clientX, e.clientY);
        // Add listener to the window for continuous tracking
        window.addEventListener("pointermove", this.handleMouseMove);
      }
    });

    // We can use a single pointerup listener on the window/document
    // so it doesn't matter where the user releases the mouse.
    window.addEventListener("pointerup", (e) => {
      // Remove the pointermove listener
      window.removeEventListener("pointermove", this.handleMouseMove);
    });
  }

  // Find the difference between the mouse and the edge of the element
  calcDiff(x, y) {
    const elemPos = this.getElemPos();
    this.diff = {
      x: x - elemPos.x,
      y: y - elemPos.y,
    };
  }

  // Get the position (x, y coords) of the given element
  getElemPos() {
    const rect = this.element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
    };
  }

  // This method needs to be bound to `this` when used as an event listener
  // We can do this with .bind(this) in the addEventListener call, or define it as an arrow function.
  // We'll define it as an arrow function here for simplicity.
  handleMouseMove = (event) => {
    event.preventDefault();
    let x = event.clientX - this.diff.x;
    let y = event.clientY - this.diff.y;

    // Check against screen edges
    const elemWidth = this.element.getBoundingClientRect().width;
    const elemHeight = this.element.getBoundingClientRect().height;

    // Check horizontal boundaries
    if (x < 0) x = 0;
    if (x + elemWidth + this.scrollbarWidth > window.innerWidth) {
      x = window.innerWidth - elemWidth - this.scrollbarWidth;
    }

    // Check vertical boundaries
    if (y < 0) y = 0;
    if (y + elemHeight > window.innerHeight) {
      y = window.innerHeight - elemHeight;
    }

    // Change style attributes to reflect movement
    this.element.style.position = "fixed";
    this.element.style.top = "0px";
    this.element.style.left = "0px";
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  };

  // check if drag behaviour should be ignored
  // this is controlled by adding the class "webdraw-controls"

  controls(e) {
    // composedPath() gets an array of all nodes the event passed through,
    // including nodes within a Shadow DOM.
    const path = e.composedPath();

    // Iterate over the elements in the path to find the control class
    for (const element of path) {
      console.log(element);
      // Check if the element has a class list
      if (element.classList && element.classList.contains("webdraw-controls")) {
        return true; // Found a control element, so ignore the drag
      }
      // Stop searching once we reach the draggable element itself, to prevent
      // the drag from being ignored by the container.
      if (element === this.element) {
        break;
      }
    }
    return false; // No control element found in the path, so proceed with drag
  }

  // Optional: Add a resize handler inside the class for consistency
  handleResize = () => {
    // Get current position
    let { x, y } = this.getElemPos();
    const elemWidth = this.element.getBoundingClientRect().width;
    const elemHeight = this.element.getBoundingClientRect().height;

    // Re-calculate position to keep element on screen
    if (x + elemWidth + this.scrollbarWidth > window.innerWidth) {
      x = window.innerWidth - elemWidth - this.scrollbarWidth;
    }
    if (y + elemHeight > window.innerHeight) {
      y = window.innerHeight - elemHeight;
    }

    // Apply new position
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  };
}
