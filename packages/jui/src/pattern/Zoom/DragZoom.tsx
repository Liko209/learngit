/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:17:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, createRef, RefObject } from 'react';
import {
  ElementRect,
  Transform,
  zoom,
} from '../../foundation/utils/calculateZoom';
import { DragArea } from '../../hoc/withDrag';
import {
  ZoomComponent,
  ZoomOptions,
  DEFAULT_OPTIONS as DEFAULT_ZOOM_OPTIONS,
} from '../../hoc/withZoom';
type JuiWithDragZoomProps = {
  autoFitContentRect?: ElementRect;
  notifyContentRectChange: () => void;
  canDrag: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
};

type JuiDragZoomProps = {
  zoomRef?: RefObject<ZoomComponent>;
  contentRef?: RefObject<any>;
  options?: Partial<JuiDragZoomOptions>;
  onAutoFitContentRectChange?: (contentRect: ElementRect) => void;
  onScaleChange?: (info: {
    scale: number;
    canDrag: boolean;
    canZoomIn: boolean;
    canZoomOut: boolean;
  }) => void;
  children: (withDragZoomProps: JuiWithDragZoomProps) => JSX.Element;
};

type JuiDragZoomState = {
  autoFitContentRect?: ElementRect;
  transform: Transform;
  canDrag: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
};

type JuiDragZoomOptions = ZoomOptions & {
  minSize: number;
  maxSize: number;
};

const DEFAULT_OPTIONS: JuiDragZoomOptions = {
  ...DEFAULT_ZOOM_OPTIONS,
  minSize: 10,
  maxSize: 20000,
};

function ensureOptions(
  options?: Partial<JuiDragZoomOptions>,
): JuiDragZoomOptions {
  return options
    ? {
      ...DEFAULT_OPTIONS,
      ...options,
    }
    : DEFAULT_OPTIONS;
}

function calculateFitSize(
  containerRect: ElementRect,
  natureContentRect: ElementRect,
) {
  if (containerRect.width === 0 || containerRect.height === 0) {
    return containerRect;
  }
  const widthRatio = natureContentRect.width / containerRect.width;
  const heightRatio = natureContentRect.height / containerRect.height;
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

function fixOffset(
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

function fixBoundary(
  transform: Transform,
  contentRect: ElementRect,
  containerRect: ElementRect,
): Transform {
  const scaleWidth = contentRect.width * transform.scale;
  const scaleHeight = contentRect.height * transform.scale;
  const scaleOffsetX = transform.scale * transform.translateX;
  const scaleOffsetY = transform.scale * transform.translateY;
  const fixOffsetX = fixOffset(scaleOffsetX, scaleWidth, containerRect.width);
  const fixOffsetY = fixOffset(scaleOffsetY, scaleHeight, containerRect.height);
  return {
    scale: transform.scale,
    translateX: fixOffsetX / transform.scale,
    translateY: fixOffsetY / transform.scale,
  };
}

function isDraggable(
  transform: Transform,
  contentRect: ElementRect,
  containerRect: ElementRect,
): boolean {
  const scaleWidth = contentRect.width * transform.scale;
  const scaleHeight = contentRect.height * transform.scale;
  return scaleHeight > containerRect.height || scaleWidth > containerRect.width;
}

class JuiDragZoom extends Component<JuiDragZoomProps, JuiDragZoomState> {
  private _zoomRef: RefObject<ZoomComponent> = createRef();
  private _contentRef: RefObject<any> = createRef();

  constructor(props: JuiDragZoomProps) {
    super(props);
    this.state = {
      transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
      canDrag: false,
      canZoomIn: true,
      canZoomOut: true,
    };
  }

  getZoomRef(): RefObject<ZoomComponent> {
    return this.props.zoomRef || this._zoomRef;
  }

  getContentRef(): RefObject<any> {
    return this.props.contentRef || this._contentRef;
  }

  getContainerRect = (): ElementRect | null => {
    const zoomRef = this.getZoomRef();
    return zoomRef.current ? zoomRef.current.getBoundingClientRect() : null;
  }

  getRawContentRect = (): ElementRect | null => {
    const contentRef = this.getContentRef();
    if (!contentRef.current) {
      return null;
    }
    const boundingRect = contentRef.current.getBoundingClientRect();
    const width =
      contentRef.current.naturalWidth ||
      contentRef.current.clientWidth ||
      boundingRect.width;
    const height =
      contentRef.current.naturalHeight ||
      contentRef.current.clientHeight ||
      boundingRect.height;
    const centerPoint = {
      left: boundingRect.left + boundingRect.width / 2,
      top: boundingRect.left + boundingRect.height / 2,
    };
    return {
      width,
      height,
      left: centerPoint.left - width / 2,
      top: centerPoint.top - height / 2,
    };
  }

  getTransformContentRect = (): ElementRect | null => {
    const contentRef = this.getContentRef();
    if (!contentRef.current) {
      return null;
    }
    return contentRef.current.getBoundingClientRect();
  }

  canZoomIn = () => {
    return this.state.canZoomIn;
  }

  canZoomOut = () => {
    return this.state.canZoomOut;
  }

  updateRect = () => {
    const contentRect = this.getRawContentRect();
    const containerRect = this.getContainerRect();
    if (contentRect && containerRect) {
      this.setState(
        {
          autoFitContentRect: calculateFitSize(containerRect, contentRect),
        },
        () => {
          this.applyNewTransform({
            scale: 1,
            translateX: 0,
            translateY: 0,
          });
        },
      );
    }
  }

  applyNewTransform = (newTransform: Transform) => {
    const contentRect = this.getTransformContentRect();
    const containerRect = this.getContainerRect();
    let transform = newTransform;
    let canDrag = this.state.canDrag;
    let canZoomIn = this.state.canZoomIn;
    let canZoomOut = this.state.canZoomOut;
    if (contentRect) {
      if (containerRect) {
        transform = fixBoundary(transform, containerRect, containerRect);
        canDrag = isDraggable(transform, containerRect, containerRect);
      }
      const { minSize, maxSize, step } = ensureOptions(this.props.options);
      const nextZoomInScale = transform.scale + step;
      const nextZoomOutScale = transform.scale - step;
      const nextZoomInRect = zoom(
        {
          fromRatio: this.state.transform.scale,
          toRatio: nextZoomInScale,
        },
        contentRect,
        { left: 0, top: 0 },
      );
      const nextZoomOutRect = zoom(
        {
          fromRatio: transform.scale,
          toRatio: nextZoomOutScale,
        },
        contentRect,
        { left: 0, top: 0 },
      );
      canZoomIn =
        nextZoomInRect.width <= maxSize && nextZoomInRect.height <= maxSize;
      canZoomOut =
        nextZoomOutRect.width >= minSize && nextZoomOutRect.height >= minSize;
    }
    this.setState({
      transform,
      canDrag,
      canZoomIn,
      canZoomOut,
    });
    this.props.onScaleChange &&
      this.props.onScaleChange({
        canDrag,
        canZoomIn,
        canZoomOut,
        scale: transform.scale,
      });
  }

  render() {
    const { children } = this.props;
    const {
      autoFitContentRect,
      transform,
      canDrag,
      canZoomIn,
      canZoomOut,
    } = this.state;
    return (
      <ZoomComponent
        ref={this.getZoomRef()}
        zoomOptions={{
          wheel: true,
        }}
        transform={transform}
        onTransformChange={(transform: Transform) => {
          this.applyNewTransform(transform);
        }}
        onZoomRectChange={(zoomRect: ElementRect) => {
          this.updateRect();
        }}
      >
        {() => (
          <DragArea
            onDragMove={({ distance, delta }) => {
              const [deltaX, deltaY] = delta;
              const newTransform = {
                ...transform,
                translateX: transform.translateX + deltaX / transform.scale,
                translateY: transform.translateY + deltaY / transform.scale,
              };
              this.applyNewTransform(newTransform);
            }}
          >
            {() =>
              React.cloneElement(
                children({
                  autoFitContentRect,
                  canDrag,
                  canZoomIn,
                  canZoomOut,
                  notifyContentRectChange: this.updateRect,
                }),
                {
                  ref: this._contentRef,
                },
              )
            }
          </DragArea>
        )}
      </ZoomComponent>
    );
  }
}

export { JuiDragZoom, JuiDragZoomProps, JuiWithDragZoomProps };
