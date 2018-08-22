const callbacks = [];
let running = false;

// fired on resize event
function resize() {
  if (running === false) {
    running = true;
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(runCallbacks);
    } else {
      setTimeout(runCallbacks, 66);
    }
  }
}

// run the actual callbacks
function runCallbacks() {
  callbacks.forEach(function (callback) {
    callback();
  });
  running = false;
}

// adds callback to loop
function addCallback(callback) {
  if (callback) {
    callbacks.push(callback);
  }
}

// public method to add additional callback
const addResizeListener = function (callback) {
  if (callbacks.length === 0) {
    window.addEventListener('resize', resize);
  }
  addCallback(callback);
}

const removeResizeListener = function () {
  window.removeEventListener('resize', resize);
}


export { addResizeListener, removeResizeListener };

// // start process
// optimizedResize.add(function () {
//   console.log('Resource conscious resize callback!')
// });