setTimeout(() => {
  // get the width of the scroll bar
  var scrollbarWidth = window.innerWidth - document.body.offsetWidth;
  // variable to store difference between mouse click location and edge of popup
  var diff = {};

  // function to get the position x,y coords of box
  var getBoxPos = function () {
    return {
      x: box.getBoundingClientRect().x,
      y: box.getBoundingClientRect().y,
    };
  };

  // find the difference between the mouse and the edge of the popup box
  var calcDiff = function (x, y) {
    var boxPos = getBoxPos();
    diff = {
      x: x - boxPos.x,
      y: y - boxPos.y,
    };
  };

  // make popup move when mouse moves turned on and off by click listeners
  var handleMouseMove = function (event) {
    event.preventDefault();
    var x = event.x;
    var y = event.y;
    x -= diff.x;
    y -= diff.y;

    // checking bumping edges of the screen
    x =
      x < 0
        ? 0
        : x + scrollbarWidth >
          window.innerWidth - box.getBoundingClientRect().width
        ? window.innerWidth - box.getBoundingClientRect().width - scrollbarWidth
        : x;
    y =
      y < 0
        ? 0
        : y > window.innerHeight - box.getBoundingClientRect().height
        ? window.innerHeight - box.getBoundingClientRect().height
        : y;

    // change style attributes to reflect movement
    box.style.position = "fixed";
    box.style.top = "0px";
    box.style.left = "0px";
    box.style.transform = "translate(" + x + "px ," + y + "px)";
  };

  // check if drag behaviour should be ignored
  // this is controled by adding the class "controls"
  function controls(e) {
    // console.log(e.target.classList)
    cl = e.target.classList;
    return cl.contains("controls");
  }

  var box = document.getElementById("controls-box");
  console.log(box);

  // track touch events and start the drag and drop for tablets
  box.addEventListener("touchstart", function (e) {
    e.preventDefault();
    //   check if control
    if (!controls(e)) {
      calcDiff(e.touches[0].clientX, e.touches[0].clientY);
      box.addEventListener("pointermove", handleMouseMove, true);
    }
  });

  // handle clicks from mouse
  box.addEventListener("mousedown", function (e) {
    console.log("box got clicked");
    // check if control
    if (!controls(e)) {
      calcDiff(e.x, e.y);
      box.addEventListener("pointermove", handleMouseMove, true);
    }
  });

  // listen for touch stop and mouseup
  box.addEventListener("pointerup", function (e) {
    console.log("onmouseup");
    // updateExtensionState(
    //   { x: e.x - diff.x, y: e.y - diff.y },
    //   "sent by end of mouse move"
    // );
    box.removeEventListener("pointermove", handleMouseMove, true);
  });

  // if drag speed exceeds box movement speed (mouse escapes popup)
  // stop the drag event
  box.addEventListener("pointerleave", function (e) {
    console.log("onmouseup");
    // console.log(e.target, this)
    if (e.target !== this) {
      console.log("not removing listener due to sub element");
    } else {
      // console.log('remove listener')
      box.removeEventListener("pointermove", handleMouseMove, true);
    }
  });

  window.addEventListener("resize", (e) => {
    //get popup position
    let { x, y } = getBoxPos();
    console.log("position", x, y);
    x =
      x + scrollbarWidth > window.innerWidth - box.getBoundingClientRect().width
        ? window.innerWidth - box.getBoundingClientRect().width - scrollbarWidth
        : x;
    y =
      y > window.innerHeight - box.getBoundingClientRect().height
        ? window.innerHeight - box.getBoundingClientRect().height
        : y;
    // updateExtensionState({ x: x, y: y }, "sent by screen resize");
    box.style.position = "fixed";
    box.style.top = "0px";
    box.style.left = "0px";
    box.style.transform = "translate(" + x + "px ," + y + "px)";
  });
}, 500);
