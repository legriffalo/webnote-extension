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


// }

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

}

class Session{
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
  /* 
::DESCRIPTION::
Creates a draggable object in js give it a target elemnt and Draggable should do the rest

::ATTRIBUTES::
target - Element to apply the draggable properties to 

::METHODS:: */
}
