/*
 * @Author: Paynter Chen
 * @Date: 2019-03-01 13:51:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, createRef, RefObject } from 'react';

import { JuiButton } from '../../components/Buttons';
import styled from '../../foundation/styled-components';
import { ZoomComponent } from '../../hoc/withZoom';
import {
  JuiDragZoom,
  JuiDragZoomOptions,
  DEFAULT_OPTIONS as DEFAULT_DRAG_ZOOM_OPTIONS,
} from './DragZoom';
import { JuiImageView } from './ImageView';
import { ElementRect } from 'src/foundation/utils/calculateZoom';

type JuiZoomImageProps = {
  src: string;
  options?: Partial<JuiZoomImageOptions>;
};

type JuiZoomImageState = {
  scale: number;
  minScale: number;
  maxScale: number;
};

type JuiZoomImageOptions = {
  minPixel: number;
  maxPixel: number;
} & JuiDragZoomOptions;

const DEFAULT_OPTIONS: JuiZoomImageOptions = {
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
  &:hover {
    ${({ draggable }) => (draggable ? 'cursor: move' : null)};
  }
`;

function ensureOptions(
  options?: Partial<JuiZoomImageOptions>,
): JuiZoomImageOptions {
  return options
    ? {
      ...DEFAULT_OPTIONS,
      ...options,
    }
    : DEFAULT_OPTIONS;
}

function formatScaleText(scale: number) {
  return `${(scale * 100).toFixed()}%`;
}

class JuiZoomImage extends Component<JuiZoomImageProps, JuiZoomImageState> {
  private _dragZoomRef: RefObject<JuiDragZoom> = createRef();
  private _zoomRef: RefObject<ZoomComponent> = createRef();
  private _imageRef: RefObject<any> = createRef();

  constructor(props: JuiZoomImageProps) {
    super(props);
    this.state = {
      scale: 1,
      minScale: 0,
      maxScale: Number.MAX_SAFE_INTEGER,
    };
  }

  updateScale(
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
      <Container>
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
          onScaleChange={({ scale }) => {
            this.setState({
              scale,
            });
          }}
          onAutoFitContentRectChange={(autoFitContentRect: ElementRect) => {
            this.updateScale(
              autoFitContentRect.width,
              autoFitContentRect.height,
              minPixel,
              maxPixel,
            );
          }}
        >
          {({
            autoFitContentRect,
            notifyContentRectChange: onContentRectChange,
            canDrag: draggable,
          }) => {
            return (
              <ImageView
                viewRef={this._imageRef}
                src={src}
                draggable={draggable}
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

export { JuiZoomImage, JuiZoomImageProps, DEFAULT_OPTIONS };
