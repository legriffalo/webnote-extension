// This should allow for much simpler management of dran elements

// newPath = {
//   color: "",
//   stroke: "",
//   path: [],
// };

class Path {
  /**
   * Represents a single drawing path.
   */
  constructor(color, stroke) {
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
  // needs to be refined to interact with layers and json storage
  toString() {
    return `Path(color='${this.color}', stroke=${this.stroke}, path_length=${this.path.length}, resX=${this.resX}, resY=${this.resY})`;
  }
}
