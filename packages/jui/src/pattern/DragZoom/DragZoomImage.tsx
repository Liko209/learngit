/*
 * @Author: Paynter Chen
 * @Date: 2019-03-01 13:51:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, createRef, RefObject } from 'react';

import { JuiButton } from '../../components/Buttons';
import { JuiImageView } from '../../components/ImageView';
import {
  ElementRect,
  JuiZoomComponent,
  Transform,
  Position,
} from '../../components/ZoomArea';
import styled from '../../foundation/styled-components';
import {
  DEFAULT_OPTIONS as DEFAULT_DRAG_ZOOM_OPTIONS,
  JuiDragZoom,
  JuiDragZoomOptions,
} from './DragZoom';

type JuiDragZoomImageProps = {
  src: string;
  options?: Partial<JuiDragZoomImageOptions>;
  positions?: Position[];
};

type JuiDragZoomImageState = {
  scale: number;
  minScale: number;
  maxScale: number;
  transform: Transform;
  contentRect: ElementRect;
};

type JuiDragZoomImageOptions = {
  minPixel: number;
  maxPixel: number;
} & JuiDragZoomOptions;

const DEFAULT_DRAG_ZOOM_IMAGE_OPTIONS: JuiDragZoomImageOptions = {
  ...DEFAULT_DRAG_ZOOM_OPTIONS,
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

const ButtonGroup = styled.div`
  bottom: 0px;
  position: absolute;
`;

const ImageView = styled(JuiImageView)<{ draggable: boolean }>`
  display: block;
  box-shadow: ${({ theme }) => theme.shadows[7]};
  &:hover {
    ${({ draggable }) => (draggable ? 'cursor: move' : null)};
  }
`;

function ensureOptions(
  options?: Partial<JuiDragZoomImageOptions>,
): JuiDragZoomImageOptions {
  return options
    ? {
      ...DEFAULT_DRAG_ZOOM_IMAGE_OPTIONS,
      ...options,
    }
    : DEFAULT_DRAG_ZOOM_IMAGE_OPTIONS;
}

function formatScaleText(scale: number) {
  return `${(scale * 100).toFixed()}%`;
}

class JuiDragZoomImage extends Component<
  JuiDragZoomImageProps,
  JuiDragZoomImageState
> {
  private _dragZoomRef: RefObject<JuiDragZoom> = createRef();
  private _zoomRef: RefObject<JuiZoomComponent> = createRef();
  private _imageRef: RefObject<any> = createRef();
  private _containerRef: RefObject<any> = createRef();

  constructor(props: JuiDragZoomImageProps) {
    super(props);
    this.state = {
      scale: 1,
      minScale: 0,
      maxScale: Number.MAX_SAFE_INTEGER,
      transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
      contentRect: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
    };
  }

  onTransformChange = (info: { transform: Transform; canDrag: boolean }) => {
    this.setState({
      transform: info.transform,
      scale: info.transform.scale,
    });
  }

  onAutoFitContentRectChange = (autoFitContentRect: ElementRect) => {
    const { minPixel, maxPixel } = ensureOptions(this.props.options);
    this._updateScale(
      autoFitContentRect.width,
      autoFitContentRect.height,
      minPixel,
      maxPixel,
    );
    this.setState({
      contentRect: autoFitContentRect,
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
    const { src, options } = this.props;
    const { minPixel, maxPixel, step, ...rest } = ensureOptions(options);
    const {
      scale,
      minScale = rest.minScale,
      maxScale = rest.maxScale,
    } = this.state;
    return (
      <Container ref={this._containerRef}>
        <JuiDragZoom
          ref={this._dragZoomRef}
          options={{
            ...rest,
            step,
            minScale,
            maxScale,
          }}
          zoomRef={this._zoomRef}
          contentRef={this._imageRef}
          onTransformChange={this.onTransformChange}
          onAutoFitContentRectChange={this.onAutoFitContentRectChange}
        >
          {({
            autoFitContentRect,
            notifyContentRectChange: onContentRectChange,
            canDrag,
          }) => {
            return (
              <ImageView
                viewRef={this._imageRef}
                src={src}
                draggable={canDrag}
                width={autoFitContentRect ? autoFitContentRect.width : 0}
                height={autoFitContentRect ? autoFitContentRect.height : 0}
                onSizeLoad={onContentRectChange}
              />
            );
          }}
        </JuiDragZoom>
        <ButtonGroup>
          <JuiButton
            disabled={scale - step < minScale}
            onClick={() => {
              this._zoomRef.current!.zoomOut();
            }}
          >
            -
          </JuiButton>
          <span>{formatScaleText(scale)}</span>
          <JuiButton
            disabled={scale + step > maxScale}
            onClick={() => {
              this._zoomRef.current!.zoomIn();
            }}
          >
            +
          </JuiButton>
          <JuiButton
            onClick={() => {
              this._zoomRef.current!.reset();
            }}
          >
            reset
          </JuiButton>
        </ButtonGroup>
      </Container>
    );
  }
}

export {
  JuiDragZoomImage,
  JuiDragZoomImageProps,
  JuiDragZoomImageOptions,
  DEFAULT_DRAG_ZOOM_IMAGE_OPTIONS,
};
