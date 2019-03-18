/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:17:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, createRef, RefObject } from 'react';
import { JuiIconButton } from '../../components/Buttons';
import { DragArea } from '../../components/DragArea';
import {
  DEFAULT_OPTIONS as DEFAULT_ZOOM_OPTIONS,
  ElementRect,
  isRectChange,
  JuiZoomComponent,
  Transform,
} from '../../components/ZoomArea';
import styled from '../../foundation/styled-components';
import { height } from '../../foundation/utils/styles';
import { JuiFabGroup } from '../ImageViewer';
import { JuiDragZoomChildrenProps, JuiDragZoomOptions } from './types';
import { calculateFitSize, fixBoundary, isDraggable } from './utils';

type JuiDragZoomProps = {
  zoomInText?: string;
  zoomOutText?: string;
  zoomRef?: RefObject<JuiZoomComponent>;
  contentRef?: RefObject<any>;
  options?: Partial<JuiDragZoomOptions>;
  onAutoFitContentRectChange?: (contentRect: ElementRect) => void;
  onTransformChange?: (info: {
    transform: Transform;
    canDrag: boolean;
  }) => void;
  children: (withDragZoomProps: JuiDragZoomChildrenProps) => any;
};

type JuiDragZoomState = {
  autoFitContentRect: ElementRect;
  transform: Transform;
  canDrag: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isDragging: boolean;
  minScale: number;
  maxScale: number;
};

const DEFAULT_DRAG_ZOOM_OPTIONS: JuiDragZoomOptions = {
  ...DEFAULT_ZOOM_OPTIONS,
  wheel: true,
  step: 0.1,
  minPixel: 10,
  maxPixel: 20000,
  padding: [32, 32, 32, 32],
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const ZoomButtonGroup = styled(JuiFabGroup)`
  position: absolute;
  bottom: ${height(6)};
  left: 50%;
  transform: translateX(-50%);
  background: white;
`;

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

function formatScaleText(scale: number) {
  return `${(scale * 100).toFixed()}%`;
}

class JuiDragZoom extends Component<JuiDragZoomProps, JuiDragZoomState> {
  private _zoomRef: RefObject<JuiZoomComponent> = createRef();
  private _contentRef: RefObject<any> = createRef();
  private _containerRef: RefObject<any> = createRef();
  contentWidth?: number;
  contentHeight?: number;

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
      minScale: 0,
      maxScale: Number.MAX_SAFE_INTEGER,
      autoFitContentRect: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
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
      this.contentWidth ||
      contentRef.current.naturalWidth ||
      contentRef.current.clientWidth ||
      boundingRect.width;
    const height =
      this.contentHeight ||
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

  reset = () => {
    this.getZoomRef().current!.reset();
  }

  updateContentSize = (contentWidth: number, contentHeight: number) => {
    this.contentWidth = contentWidth;
    this.contentHeight = contentHeight;
    this.updateRect();
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
      if (
        !this.state.autoFitContentRect ||
        isRectChange(this.state.autoFitContentRect, newAutoFitContentRect)
      ) {
        this.applyNewTransform({
          scale: 1,
          translateX: 0,
          translateY: 0,
        });
        this._onAutoFitContentRectChange(newAutoFitContentRect);
      }
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

  onTransformChange = (info: { transform: Transform; canDrag: boolean }) => {
    this.setState({
      transform: info.transform,
    });
  }

  private _onAutoFitContentRectChange = (autoFitContentRect: ElementRect) => {
    const { minPixel, maxPixel } = ensureOptions(this.props.options);
    this._updateScale(
      autoFitContentRect.width,
      autoFitContentRect.height,
      minPixel,
      maxPixel,
    );
    this.setState({
      autoFitContentRect,
    });
  }

  private _updateScale(
    contentWidth: number,
    contentHeight: number,
    minPixel: number,
    maxPixel: number,
  ) {
    if (contentWidth > 0 && contentHeight > 0) {
      this.setState({
        minScale: minPixel / Math.min(contentWidth, contentHeight),
        maxScale: maxPixel / Math.max(contentWidth, contentHeight),
      });
    }
  }
  render() {
    const { options, zoomInText, zoomOutText, children } = this.props;
    const { autoFitContentRect, transform, canDrag } = this.state;
    const { minPixel, maxPixel, step, ...zoomOptions } = ensureOptions(options);

    const {
      minScale = zoomOptions.minScale,
      maxScale = zoomOptions.maxScale,
    } = this.state;
    return (
      <Container ref={this._containerRef}>
        <JuiZoomComponent
          ref={this.getZoomRef()}
          zoomOptions={{ ...zoomOptions, minScale, maxScale }}
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
                    transform,
                    notifyContentSizeChange: this.updateContentSize,
                  }),
                  {
                    ref: this._contentRef,
                  },
                )}
            </DragArea>
          )}
        </JuiZoomComponent>
        <ZoomButtonGroup
          className="zoomGroup"
          centerText={formatScaleText(transform.scale)}
          ZoomOut={
            <JuiIconButton
              variant="plain"
              tooltipTitle={zoomOutText}
              ariaLabel={zoomOutText}
              disabled={transform.scale - step < minScale}
              onClick={() => {
                this.getZoomRef().current!.zoomOut();
              }}
            >
              zoom_out
            </JuiIconButton>
          }
          ZoomIn={
            <JuiIconButton
              variant="plain"
              tooltipTitle={zoomInText}
              ariaLabel={zoomInText}
              disabled={transform.scale + step > maxScale}
              onClick={() => {
                this.getZoomRef().current!.zoomIn();
              }}
            >
              zoom_in
            </JuiIconButton>
          }
        />
      </Container>
    );
  }
}

export {
  JuiDragZoom,
  JuiDragZoomProps,
  JuiDragZoomChildrenProps as JuiWithDragZoomProps,
  JuiDragZoomOptions,
  DEFAULT_DRAG_ZOOM_OPTIONS as DEFAULT_OPTIONS,
};
