/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:17:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, createRef, RefObject } from 'react';
import { DragArea } from '../../components/DragArea';
import {
  ElementRect,
  Transform,
  JuiZoomComponent,
  JuiZoomOptions,
  DEFAULT_OPTIONS as DEFAULT_ZOOM_OPTIONS,
} from '../../components/ZoomArea';
import styled from '../../foundation/styled-components';

const StyledZoomComponent = styled(JuiZoomComponent)<{ transition?: string }>`
  div {
    ${({ transition }) => (transition ? `transition: ${transition};` : null)}
  }
`;

type JuiWithDragZoomProps = {
  autoFitContentRect?: ElementRect;
  notifyContentRectChange: () => void;
  canDrag: boolean;
  isDragging: boolean;
};

type JuiDragZoomProps = {
  zoomRef?: RefObject<JuiZoomComponent>;
  contentRef?: RefObject<any>;
  options?: Partial<JuiDragZoomOptions>;
  onAutoFitContentRectChange?: (contentRect: ElementRect) => void;
  onTransformChange?: (info: {
    transform: Transform;
    canDrag: boolean;
  }) => void;
  children: (withDragZoomProps: JuiWithDragZoomProps) => JSX.Element;
};

type JuiDragZoomState = {
  autoFitContentRect?: ElementRect;
  transform: Transform;
  canDrag: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isDragging: boolean;
};

type Padding = [number, number, number, number];

type JuiDragZoomOptions = JuiZoomOptions & {
  padding: Padding; // left, top, right, bottom
};

const DEFAULT_DRAG_ZOOM_OPTIONS: JuiDragZoomOptions = {
  ...DEFAULT_ZOOM_OPTIONS,
  wheel: true,
  padding: [10, 10, 10, 10],
};

function ensureOptions(
  options?: Partial<JuiDragZoomOptions>,
): JuiDragZoomOptions {
  return options
    ? {
      ...DEFAULT_DRAG_ZOOM_OPTIONS,
      ...options,
    }
    : DEFAULT_DRAG_ZOOM_OPTIONS;
}

function calculateFitSize(
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

function isDraggable(
  contentWidth: number,
  contentHeight: number,
  containerRect: ElementRect,
): boolean {
  return (
    contentWidth > containerRect.height || contentHeight > containerRect.width
  );
}

class JuiDragZoom extends Component<JuiDragZoomProps, JuiDragZoomState> {
  private _zoomRef: RefObject<JuiZoomComponent> = createRef();
  private _contentRef: RefObject<any> = createRef();

  constructor(props: JuiDragZoomProps) {
    super(props);
    this.state = {
      isDragging: false,
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

  getZoomRef(): RefObject<JuiZoomComponent> {
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
    const centerPosition = {
      left: boundingRect.left + boundingRect.width / 2,
      top: boundingRect.left + boundingRect.height / 2,
    };
    return {
      width,
      height,
      left: centerPosition.left - width / 2,
      top: centerPosition.top - height / 2,
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
      const newAutoFitContentRect = calculateFitSize(
        containerRect,
        contentRect,
        ensureOptions(this.props.options).padding,
      );
      this.setState({
        autoFitContentRect: newAutoFitContentRect,
      });
      this.applyNewTransform({
        scale: 1,
        translateX: 0,
        translateY: 0,
      });
      this.props.onAutoFitContentRectChange &&
        this.props.onAutoFitContentRectChange(newAutoFitContentRect);
    }
  }

  applyNewTransform = (newTransform: Transform) => {
    const contentRect = this.getTransformContentRect();
    const containerRect = this.getContainerRect();
    let transform = newTransform;
    const oldTransform = this.state.transform;
    let canDrag = this.state.canDrag;
    if (contentRect && containerRect) {
      const newWidth =
        (contentRect.width * transform.scale) / oldTransform.scale;
      const newHeight =
        (contentRect.height * transform.scale) / oldTransform.scale;
      transform = fixBoundary(transform, newWidth, newHeight, containerRect);
      canDrag = isDraggable(newWidth, newHeight, containerRect);
    }
    this.setState({
      transform,
      canDrag,
    });
    this.props.onTransformChange &&
      this.props.onTransformChange({
        transform,
        canDrag,
      });
  }

  render() {
    const { children } = this.props;
    const { autoFitContentRect, transform, canDrag, isDragging } = this.state;
    const { ...zoomOptions } = ensureOptions(this.props.options);
    return (
      <StyledZoomComponent
        ref={this.getZoomRef()}
        zoomOptions={zoomOptions}
        transform={transform}
        transition={isDragging ? undefined : 'all ease 0.3s'}
        onTransformChange={(transform: Transform) => {
          this.applyNewTransform(transform);
        }}
        onZoomRectChange={(zoomRect: ElementRect) => {
          this.updateRect();
        }}
      >
        {() => (
          <DragArea
            onDragMove={({ isDragging, delta }) => {
              const [deltaX, deltaY] = delta;
              const newTransform = {
                ...transform,
                translateX: transform.translateX + deltaX / transform.scale,
                translateY: transform.translateY + deltaY / transform.scale,
              };
              this.applyNewTransform(newTransform);
              if (this.state.isDragging !== isDragging) {
                this.setState({ isDragging });
              }
            }}
            onDragEnd={() => {
              this.setState({ isDragging: false });
            }}
          >
            {({ isDragging }) =>
              React.cloneElement(
                children({
                  autoFitContentRect,
                  canDrag,
                  isDragging,
                  notifyContentRectChange: this.updateRect,
                }),
                {
                  ref: this._contentRef,
                },
              )}
          </DragArea>
        )}
      </StyledZoomComponent>
    );
  }
}

export {
  JuiDragZoom,
  JuiDragZoomProps,
  JuiWithDragZoomProps,
  JuiDragZoomOptions,
  DEFAULT_DRAG_ZOOM_OPTIONS as DEFAULT_OPTIONS,
};
