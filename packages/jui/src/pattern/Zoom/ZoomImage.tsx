/*
 * @Author: Paynter Chen
 * @Date: 2019-03-01 13:51:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, createRef, RefObject } from 'react';

import { JuiButton } from '../../components/Buttons';
import styled from '../../foundation/styled-components';
import { ZoomComponent } from '../../hoc/withZoom';
import { JuiDragZoom } from './DragZoom';
import { JuiImageView } from './ImageView';

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
  &:hover {
    ${({ draggable }) => (draggable ? 'cursor: move' : null)};
  }
`;

type JuiZoomProps = {
  src: string;
};

type JuiZoomState = {
  scale: string;
  canZoomIn: boolean;
  canZoomOut: boolean;
};

function formatScaleText(scale: number) {
  return `${(scale * 100).toFixed()}%`;
}

class JuiZoomImage extends Component<JuiZoomProps, JuiZoomState> {
  private _dragZoomRef: RefObject<JuiDragZoom> = createRef();
  private _zoomRef: RefObject<ZoomComponent> = createRef();
  private _imageRef: RefObject<any> = createRef();

  constructor(props: JuiZoomProps) {
    super(props);
    this.state = {
      scale: formatScaleText(1),
      canZoomIn: false,
      canZoomOut: false,
    };
  }

  render() {
    const { src } = this.props;
    return (
      <Container>
        <JuiDragZoom
          ref={this._dragZoomRef}
          zoomRef={this._zoomRef}
          contentRef={this._imageRef}
          onScaleChange={({ scale, canZoomIn, canZoomOut }) => {
            this.setState({
              canZoomIn,
              canZoomOut,
              scale: formatScaleText(scale),
            });
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
            disabled={!this.state.canZoomOut}
            onClick={() => {
              this._zoomRef.current!.zoomOut();
            }}
          >
            -
          </JuiButton>
          <span>{this.state.scale}</span>
          <JuiButton
            disabled={!this.state.canZoomIn}
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

export { JuiZoomImage, JuiZoomProps };
