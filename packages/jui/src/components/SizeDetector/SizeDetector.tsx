/*
 * @Author: isaac.liu
 * @Date: 2019-04-01 14:20:42
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

type Size = {
  width: number;
  height: number;
};

type JuiSizeDetectorProps = {
  sources?: HTMLElement[];
  handleSizeChanged: (size: Size) => void;
};

const JuiSizeDetector = ({
  sources,
  handleSizeChanged,
}: JuiSizeDetectorProps) => {
  let targets = sources;
  const body = window.document.getElementsByTagName('body')[0];
  if (!targets) {
    targets = [body];
  } else if (!targets.includes(body)) {
    targets.push(body);
  }

  const updateSize = (entries: ResizeObserverEntry[]) => {
    const { width, height } = entries[0].contentRect;
    handleSizeChanged({ width, height });
  };
  useEffect(() => {
    if (targets) {
      const disposers: ResizeObserver[] = targets.map((target: HTMLElement) => {
        const observer = new ResizeObserver(updateSize);
        observer.observe(target);
        return observer;
      });
      return () => disposers.forEach((ro: ResizeObserver) => ro.disconnect());
    }

    return () => {};
  },        []);
  return <></>;
};

type ResizeCallback = (manager: ISizeManager) => void;

interface ISizeManager {
  updateSize: (key: string, size: Size) => void;
  addConstantSize: (key: string, size: Size) => void;
  removeConstantSize: (key: string) => void;
  getSize: (key: string) => Size;
  getUsedSize: (key: string) => Size;
  addResizeCallback: (callback: ResizeCallback) => void;
  removeResizeCallback: (callback: ResizeCallback) => void;
  removeAllCallback: () => void;
}

class JuiSizeManager implements ISizeManager {
  private _sizes: { [key: string]: Size } = {};
  private _resizeCallback: ResizeCallback[] = [];
  private _notifySizeChanged = () => {
    this._resizeCallback.forEach((callback: ResizeCallback) => {
      callback(this);
    });
  }
  updateSize = (key: string, size: Size) => {
    if (key) {
      this._sizes[key] = size;
      this._notifySizeChanged();
    }
  }
  addConstantSize = (key: string, size: Size) => {
    this.updateSize(key, size);
  }
  removeConstantSize = (key: string) => {
    if (key) {
      delete this._sizes[key];
      this._notifySizeChanged();
    }
  }
  getSize = (key: string) => {
    return this._sizes[key] || { width: 0, height: 0 };
  }
  getUsedSize = (key: string) => {
    const accSize: Size = { width: 0, height: 0 };
    Object.keys(this._sizes).forEach((keyLooper: string) => {
      if (keyLooper !== key) {
        const sizeLooper = this._sizes[keyLooper];
        accSize.width += sizeLooper.width;
        accSize.height += sizeLooper.height;
      }
    });
    return accSize;
  }
  addResizeCallback = (callback: ResizeCallback) => {
    if (!this._resizeCallback.includes(callback)) {
      this._resizeCallback.push(callback);
    }
  }

  removeResizeCallback = (callback: ResizeCallback) => {
    const index = this._resizeCallback.indexOf(callback);
    if (index !== -1) {
      this._resizeCallback.splice(index, 1);
    }
  }

  removeAllCallback = () => {
    this._resizeCallback = [];
  }
}

export {
  JuiSizeDetector,
  JuiSizeDetectorProps,
  Size,
  ISizeManager,
  JuiSizeManager,
};
