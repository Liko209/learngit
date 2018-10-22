/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:20:01
 * Copyright © RingCentral. All rights reserved.
 */

type ResizeFunction = (evt: Event) => void;

let callback: ResizeFunction | null;
let scheduledAnimationFrame = false;

const onResize = (e: UIEvent) => {
  if (scheduledAnimationFrame) {
    return;
  }
  scheduledAnimationFrame = true;
  window.requestAnimationFrame(() => {
    scheduledAnimationFrame = false;
    if (callback instanceof Function) {
      callback(e);
    }
  });
};

const addResizeListener = function (resize: ResizeFunction) {
  callback = resize;
  window.addEventListener('resize', onResize);
};

const removeResizeListener = function () {
  callback = null;
  window.removeEventListener('resize', onResize);
};

export { addResizeListener, removeResizeListener };
