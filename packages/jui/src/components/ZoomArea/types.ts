/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 12:42:17
 * Copyright © RingCentral. All rights reserved.
 */
type ElementRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Position = {
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

export { ElementRect, Position, ZoomRatio, Transform };
