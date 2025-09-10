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

  constructor(color, opacity, weight, canvas) {
    //@type {string}
    this.color = color;
    //@type {number}
    this.opacity = opacity;
    //@type {number}
    this.weight = weight;
    //@type {htmlm obj by id}
    this.canvas = canvas;
    //@type {Array<Array<number>>}
    this.path = [];
  }
  // store coords
  addCoords(x, y) {
    this.path.push([x, y]);
  }
  drawPath() {
    // may be better to access as a listener
  }
}
