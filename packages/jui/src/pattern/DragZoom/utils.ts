/*
 * @Author: Paynter Chen
 * @Date: 2019-03-13 12:19:46
 * Copyright © RingCentral. All rights reserved.
 */
import { ElementRect, Transform } from '../../components/ZoomArea';
import { Padding } from './types';

export function calculateFitSize(
  containerRect: ElementRect,
  natureContentRect: ElementRect,
  padding: Padding,
) {
  if (containerRect.width === 0 || containerRect.height === 0) {
    return containerRect;
  }
  const paddingContainer = {
    left: containerRect.left + padding[0],
    top: containerRect.top + padding[1],
    width: containerRect.width - padding[0] - padding[2],
    height: containerRect.height - padding[1] - padding[3],
  };
  const widthRatio = natureContentRect.width / paddingContainer.width;
  const heightRatio = natureContentRect.height / paddingContainer.height;
  const largerRatio = Math.max(widthRatio, heightRatio);
  const result = {} as ElementRect;
  if (largerRatio <= 1) {
    result.width = natureContentRect.width;
    result.height = natureContentRect.height;
  } else {
    result.width = natureContentRect.width / largerRatio;
    result.height = natureContentRect.height / largerRatio;
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
