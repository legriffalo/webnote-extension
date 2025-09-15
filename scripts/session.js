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

// class DoodleManager {
//       constructor(canvasElement) {
//           this.canvas = canvasElement;
//           this.ctx = canvasElement.getContext('2d');
//           this.doodles = [];
//           this.isDrawing = false;
//           // Bind event handlers to the class instance
//           this._onMouseDown = this._onMouseDown.bind(this);
//           this._onMouseMove = this._onMouseMove.bind(this);
//           this._onMouseUp = this._onMouseUp.bind(this);
//           this._onResize = this._onResize.bind(this); // For canvas resizing
//           this.addListeners();
//       }
//       addListeners() {
//           this.canvas.addEventListener('mousedown', this._onMouseDown);
//           this.canvas.addEventListener('mousemove', this._onMouseMove);
//           window.addEventListener('mouseup', this._onMouseUp); // Listen globally for mouse up
//           window.addEventListener('resize', this._onResize);
//       }
//       removeListeners() {
//           this.canvas.removeEventListener('mousedown', this._onMouseDown);
//           this.canvas.removeEventListener('mousemove', this._onMouseMove);
//           window.removeEventListener('mouseup', this._onMouseUp);
//           window.removeEventListener('resize', this._onResize);
//       }
//       _onMouseDown(e) {
//           this.isDrawing = true;
//           // Start a new doodle, record initial point
//           // ...
//       }
//       _onMouseMove(e) {
//           if (!this.isDrawing) return;
//           // Add points to current doodle
//           // ...
//       }
//       _onMouseUp(e) {
//           this.isDrawing = false;
//           // Finalize doodle
//           // ...
//       }
//       _onResize() {
//           // Adjust canvas size, redraw doodles
//           // ...
//       }
//       // Other methods for managing doodle data (add, remove, serialize, etc.)
//       addDoodle(doodleData) { /* ... */ }
//       getDoodles() { /* ... */ }
//   }
