type ElementRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Point = {
  left: number;
  top: number;
};

type ZoomRatio = {
  fromRatio: number;
  toRatio: number;
};

type Transform = {
  scale: number;
  translateX: number;
  translateY: number;
};

function isZoomRatio(arg: any): arg is ZoomRatio {
  return (
    Object.prototype.toString.call(arg) === '[object Object]' &&
    (<Object>arg).hasOwnProperty('fromRatio') &&
    (<Object>arg).hasOwnProperty('toRatio')
  );
}

function zoom(
  ratio: number | ZoomRatio,
  rect: ElementRect,
  center: Point,
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

export { zoom, ElementRect, Point, ZoomRatio, Transform };
