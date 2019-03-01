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

export { ElementRect, Point, ZoomRatio, Transform };
