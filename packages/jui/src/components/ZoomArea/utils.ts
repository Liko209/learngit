/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 12:42:13
 * Copyright © RingCentral. All rights reserved.
 */
import { ElementRect, ZoomRatio, Position } from './types';
import _ from 'lodash';

export function getCenterPosition(react: ElementRect) {
  return {
    left: react.left + react.width / 2,
    top: react.top + react.height / 2,
  };
}

function isZoomRatio(arg: any): arg is ZoomRatio {
  return (
    Object.prototype.toString.call(arg) === '[object Object]' &&
    (<Object>arg).hasOwnProperty('fromRatio') &&
    (<Object>arg).hasOwnProperty('toRatio')
  );
}

export function isRectChange(rect1: ElementRect, rect2: ElementRect) {
  return !_.isEqual(rect1, rect2);
}

export function zoom(
  ratio: number | ZoomRatio,
  rect: ElementRect,
  center: Position,
): ElementRect {
  const distanceX = rect.left - center.left;
  const distanceY = rect.top - center.top;
  let newDistanceX;
  let newDistanceY;
  let newWidth;
  let newHeight;
  if (isZoomRatio(ratio)) {
    newDistanceX = (distanceX * ratio.toRatio) / ratio.fromRatio;
    newDistanceY = (distanceY * ratio.toRatio) / ratio.fromRatio;
    newWidth = (rect.width * ratio.toRatio) / ratio.fromRatio;
    newHeight = (rect.height * ratio.toRatio) / ratio.fromRatio;
  } else {
    newDistanceX = distanceX * ratio;
    newDistanceY = distanceY * ratio;
    newWidth = rect.width * ratio;
    newHeight = rect.height * ratio;
  }
  const left = center.left + newDistanceX;
  const top = center.top + newDistanceY;
  return {
    left,
    top,
    width: newWidth,
    height: newHeight,
  };
}
