/*
 * @Author: Paynter Chen
 * @Date: 2019-03-13 12:19:46
 * Copyright © RingCentral. All rights reserved.
 */
import { ElementRect, Transform } from '../../components/ZoomArea';
import { Padding } from './types';

export function calculateFitSize(
  containerRect: ElementRect,
  contentRect: ElementRect,
  padding: Padding,
  minContentLength?: number,
) {
  if (containerRect.width === 0 || containerRect.height === 0) {
    return containerRect;
  }
  const [pl, pt, pr, pb] = padding;
  const constrictWidth = containerRect.width - pl - pr;
  const constrictHeight = containerRect.height - pt - pb;
  const min = minContentLength === undefined ? 100 : minContentLength;
  const pw =
    constrictWidth > min ? pl + pr : Math.max(0, containerRect.width - min);
  const ph =
    constrictHeight > min ? pt + pb : Math.max(0, containerRect.height - min);
  const paddingContainer = {
    left: containerRect.left + pw / 2,
    top: containerRect.top + ph / 2,
    width: containerRect.width - pw,
    height: containerRect.height - ph,
  };
  const widthRatio = contentRect.width / paddingContainer.width;
  const heightRatio = contentRect.height / paddingContainer.height;
  const largerRatio = Math.max(widthRatio, heightRatio);
  const result = {} as ElementRect;
  if (largerRatio <= 1) {
    result.width = contentRect.width;
    result.height = contentRect.height;
  } else {
    result.width = contentRect.width / largerRatio;
    result.height = contentRect.height / largerRatio;
  }
  result.left = containerRect.left + (containerRect.width - result.width) / 2;
  result.top = containerRect.top + (containerRect.height - result.height) / 2;
  return result;
}

export function fixOffset(
  offset: number,
  contentWidth: number,
  containerWidth: number,
) {
  if (contentWidth < containerWidth) {
    return 0;
  }
  const range = (contentWidth - containerWidth) / 2;
  if (offset >= -range && offset <= range) {
    return offset;
  }
  if (offset < -range) {
    return -range;
  }
  return range;
}

export function fixBoundary(
  transform: Transform,
  contentWidth: number,
  contentHeight: number,
  containerRect: ElementRect,
): Transform {
  const scaleOffsetX = transform.scale * transform.translateX;
  const scaleOffsetY = transform.scale * transform.translateY;
  const fixOffsetX = fixOffset(scaleOffsetX, contentWidth, containerRect.width);
  const fixOffsetY = fixOffset(
    scaleOffsetY,
    contentHeight,
    containerRect.height,
  );
  if (fixOffsetX === scaleOffsetX && fixOffsetY === scaleOffsetY) {
    return transform;
  }
  return {
    scale: transform.scale,
    translateX: fixOffsetX / transform.scale,
    translateY: fixOffsetY / transform.scale,
  };
}

export function isDraggable(
  contentWidth: number,
  contentHeight: number,
  containerRect: ElementRect,
): boolean {
  return (
    contentWidth > containerRect.height || contentHeight > containerRect.width
  );
}
