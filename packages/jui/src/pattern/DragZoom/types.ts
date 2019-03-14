/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-11 17:25:57
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ElementRect,
  Transform,
  JuiZoomOptions,
} from '../../components/ZoomArea';

export type Padding = [number, number, number, number];

export type JuiDragZoomChildrenProps = {
  autoFitContentRect?: ElementRect;
  notifyContentSizeChange: (
    contentWidth?: number,
    contentHeight?: number,
  ) => void;
  canDrag: boolean;
  isDragging: boolean;
  transform: Transform;
};

export type JuiDragZoomOptions = JuiZoomOptions & {
  minPixel: number;
  maxPixel: number;
  padding: Padding; // left, top, right, bottom
};
