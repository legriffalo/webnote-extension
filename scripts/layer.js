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
