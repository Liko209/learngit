/*
 * @Author: Paynter Chen
 * @Date: 2019-03-13 12:19:46
 * Copyright © RingCentral. All rights reserved.
 */
import { Transform } from '../../components/ZoomArea';
import { Padding } from './types';

export function calculateFitWidthHeight(
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding: Padding,
  minContentLength?: number,
): [number, number] {
  if (containerWidth === 0 || containerHeight === 0) {
    return [contentWidth, contentHeight];
  }

  const [pl, pt, pr, pb] = padding;
  const constrictWidth = containerWidth - pl - pr;
  const constrictHeight = containerHeight - pt - pb;
  const min = minContentLength === undefined ? 100 : minContentLength;
  const pw = constrictWidth > min ? pl + pr : Math.max(0, containerWidth - min);
  const ph =
    constrictHeight > min ? pt + pb : Math.max(0, containerHeight - min);
  const width = containerWidth - pw;
  const height = containerHeight - ph;

  const widthRatio = contentWidth / width;
  const heightRatio = contentHeight / height;
  const largerRatio = Math.max(widthRatio, heightRatio);
  // const result = {} as ElementRect;
  if (largerRatio <= 1) {
    return [contentWidth, contentHeight];
  }
  return [contentWidth / largerRatio, contentHeight / largerRatio];
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
  containerWidth: number,
  containerHeight: number,
): Transform {
  const scaleOffsetX = transform.scale * transform.translateX;
  const scaleOffsetY = transform.scale * transform.translateY;
  const newContentWidth = contentWidth * transform.scale;
  const newContentHeight = contentHeight * transform.scale;
  const fixOffsetX = fixOffset(scaleOffsetX, newContentWidth, containerWidth);
  const fixOffsetY = fixOffset(scaleOffsetY, newContentHeight, containerHeight);
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
  containerWidth: number,
  containerHeight: number,
): boolean {
  return contentWidth > containerWidth || contentHeight > containerHeight;
}
