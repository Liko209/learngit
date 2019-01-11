/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:20:01
 * Copyright © RingCentral. All rights reserved.
 */

type ResizeFunction = (evt: Event) => void;

export default class Optimizer {
  callback: ResizeFunction | null;
  scheduledAnimationFrame = false;

  onResize = (e: UIEvent) => {
    if (this.scheduledAnimationFrame) {
      return;
    }
    this.scheduledAnimationFrame = true;
    window.requestAnimationFrame(() => {
      this.scheduledAnimationFrame = false;
      if (this.callback instanceof Function) {
        this.callback(e);
      }
    });
  }

  addResizeListener = (resize: ResizeFunction) => {
    this.callback = resize;
    window.addEventListener('resize', this.onResize);
  }

  removeResizeListener = () => {
    this.callback = null;
    window.removeEventListener('resize', this.onResize);
  }
}
