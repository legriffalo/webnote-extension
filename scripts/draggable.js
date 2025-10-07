(function (window) {
  // Check if the class is already defined on the 'window' (in our isolated scope)
  if (window.Draggable) {
    return; // Already loaded, exit.
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

      this.element.addEventListener("pointerdown", (e) => {
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
        // console.log(element);
        // Check if the element has a class list
        if (
          element.classList &&
          element.classList.contains("webdraw-controls")
        ) {
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
  window.Draggable = Draggable;
})(window);
