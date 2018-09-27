/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:20:01
 * Copyright © RingCentral. All rights reserved.
 */

const callbacks: Function[] = [];
let running = false;

// fired on resize event
function resize() {
  if (!running) {
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
  callbacks.forEach((callback: Function) => {
    callback();
  });
  running = false;
}

// adds callback to loop
function addCallback(callback: Function) {
  if (callback) {
    callbacks.push(callback);
  }
}

// public method to add additional callback
const addResizeListener = function (callback: Function) {
  if (callbacks.length === 0) {
    window.addEventListener('resize', resize);
  }
  addCallback(callback);
};

const removeResizeListener = function () {
  window.removeEventListener('resize', resize);
};

export { addResizeListener, removeResizeListener };

// start process
// optimizer.addResizeListener(function () {
//   console.log('Resource conscious resize callback!')
// });
