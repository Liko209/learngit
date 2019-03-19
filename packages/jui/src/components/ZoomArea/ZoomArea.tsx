/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:18
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { RefObject } from 'react';
import ReactResizeDetector from 'react-resize-detector';

import styled from '../../foundation/styled-components';
import { Omit } from '../../foundation/utils/typeHelper';
import { ElementRect, Position, Transform } from './types';
import { getCenterPosition } from './utils';

type JuiZoomProps = {
  transform: Transform;
  onTransformChange: (newTransform: Transform) => void;
  children: (withZoomProps: JuiWithZoomProps) => JSX.Element;
  className?: string;
  viewRef?: RefObject<HTMLDivElement>;
  zoomOptions?: Partial<JuiZoomOptions>;
  onZoomRectChange?: (newZoomRect: ElementRect) => void;
};

type JuiWithZoomProps = Pick<JuiZoomProps, 'transform'> & {
  zoomIn: (zoomCenter?: Position) => void;
  zoomOut: (zoomCenter?: Position) => void;
};

type JuiZoomState = {
  zoomRect: ElementRect;
};

type JuiZoomOptions = {
  step: number;
  minScale: number;
  maxScale: number;
  wheel: boolean;
};

const DEFAULT_OPTIONS: JuiZoomOptions = {
  step: 0.1,
  minScale: 0.1,
  maxScale: Number.MAX_SAFE_INTEGER,
  wheel: false,
};

const Container = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const ZoomWrapper = styled.div`
  position: relative;
`;

function ensureOptions(zoomOptions?: Partial<JuiZoomOptions>): JuiZoomOptions {
  return zoomOptions
    ? {
      ...DEFAULT_OPTIONS,
      ...zoomOptions,
    }
    : DEFAULT_OPTIONS;
}

class JuiZoomComponent extends React.Component<JuiZoomProps, JuiZoomState> {
  private _viewRef: RefObject<HTMLDivElement> = React.createRef();

  constructor(props: JuiZoomProps) {
    super(props);
    this.state = {
      zoomRect: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
    };
  }

  getBoundingClientRect(): ElementRect {
    return this.getViewRef().current.getBoundingClientRect();
  }

  getTransform(): Transform {
    return this.props.transform;
  }

  getViewRef(): RefObject<any> {
    return this.props.viewRef || this._viewRef;
  }

  zoomStep = (scaleStep: number, zoomCenterPosition?: Position) => {
    const { scale } = this.props.transform;
    const newScale = scale + scaleStep;
    this.zoomTo(newScale, zoomCenterPosition);
  }

  zoomIn = () => {
    this.zoomStep(ensureOptions(this.props.zoomOptions).step);
  }

  zoomOut = () => {
    this.zoomStep(-ensureOptions(this.props.zoomOptions).step);
  }

  zoomTo = (newScale: number, zoomCenterPosition?: Position) => {
    const { scale, translateX, translateY } = this.props.transform;
    const { maxScale, minScale } = ensureOptions(this.props.zoomOptions);
    const fixNewScale = newScale;
    if (
      (fixNewScale > scale && fixNewScale > maxScale) ||
      (fixNewScale < scale && fixNewScale < minScale)
    ) {
      return;
    }
    let translateOffsetX = 0;
    let translateOffsetY = 0;
    if (zoomCenterPosition) {
      const rect = this.getViewRef().current.getBoundingClientRect();
      const rectCenter = getCenterPosition(rect);
      translateOffsetX = zoomCenterPosition.left - rectCenter.left;
      translateOffsetY = zoomCenterPosition.top - rectCenter.top;
    }
    this.props.onTransformChange({
      scale: fixNewScale,
      translateX:
        translateX -
        (translateOffsetX * (fixNewScale / scale - 1)) / fixNewScale,
      translateY:
        translateY -
        (translateOffsetY * (fixNewScale / scale - 1)) / fixNewScale,
    });
  }

  reset = () => {
    this.props.onTransformChange({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }

  onWheel = (ev: React.WheelEvent) => {
    const { step, wheel } = ensureOptions(this.props.zoomOptions);
    if (!wheel) return;
    ev.preventDefault();
    ev.stopPropagation();
    const point: Position = {
      left: ev.pageX,
      top: ev.pageY,
    };
    const sign = ev.deltaY > 0 ? -1 : 1;
    const { scale } = this.props.transform;
    const factor = Math.min(Math.abs(ev.deltaY), 10) / 10;
    const { maxScale, minScale } = ensureOptions(this.props.zoomOptions);
    const toScale = scale + sign * step * scale * factor;
    this.zoomTo(Math.max(Math.min(toScale, maxScale), minScale), point);
  }

  render() {
    const { children, transform, onZoomRectChange, className } = this.props;
    const zoomProps: JuiWithZoomProps = {
      transform,
      zoomIn: this.zoomIn,
      zoomOut: this.zoomOut,
    };
    return (
      <Container ref={this.getViewRef()} className={className}>
        <ZoomWrapper onWheel={this.onWheel}>{children(zoomProps)}</ZoomWrapper>
        <ReactResizeDetector
          handleHeight={true}
          handleWidth={true}
          onResize={(width, height) => {
            const zoomRect = {
              width,
              height,
              left: 0,
              top: 0,
            };
            this.setState(
              {
                zoomRect,
              },
              () => {
                onZoomRectChange && onZoomRectChange(zoomRect);
              },
            );
          }}
        />
      </Container>
    );
  }
}

class JuiZoomArea extends React.Component<
  Omit<JuiZoomProps, 'transform' | 'onTransformChange'>,
  { transform: Transform }
> {
  constructor(props: Omit<JuiZoomProps, 'transform' | 'onTransformChange'>) {
    super(props);
    this.state = {
      transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
    };
  }
  render() {
    return React.createElement(JuiZoomComponent, {
      ...this.props,
      transform: this.state.transform,
      onTransformChange: (newTransform: Transform) => {
        this.setState({
          transform: newTransform,
        });
      },
    });
  }
}

export {
  JuiWithZoomProps,
  JuiZoomProps,
  JuiZoomComponent,
  JuiZoomArea,
  JuiZoomOptions,
  DEFAULT_OPTIONS,
};
