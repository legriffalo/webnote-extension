// class to store paths in groupings based on screen def and user choices

// newLayer = {
//   show:true,
//   name?:"",
//   resX:3,
//   resY:3,
//   paths:[] //multiple path objects
// };

class Layer {
  /**
   * Represents a layer containing multiple drawing paths.
   */
  constructor(name = "default", resX, resY) {
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
    /**
     * The document width when the path started being drawn.
     * @type {number}
     */
    this.resX = resX;
    /**
     * The document height when the path started being drawn.
     * @type {number}
     */
    this.resY = resY;
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

  // this needs to be changed to get the stringified version of paths or it won't allow reconstituting data from state
  toString() {
    return `Layer(name='${this.name}', path_count=${this.paths.length})`;
  }
}
