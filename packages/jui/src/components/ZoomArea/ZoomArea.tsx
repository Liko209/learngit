/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:18
 * Copyright © RingCentral. All rights reserved.
 */
import _, { throttle } from 'lodash';
import React, { RefObject } from 'react';
import ReactResizeDetector from 'react-resize-detector';

import styled from '../../foundation/styled-components';
import { Omit } from '../../foundation/utils/typeHelper';
import { ElementRect, Point, Transform } from './types';
import { getCenterPoint } from './utils';

type JuiZoomProps = {
  transform: Transform;
  onTransformChange: (newTransform: Transform) => void;
  children: (withZoomProps: JuiWithZoomProps) => JSX.Element;
  viewRef?: RefObject<HTMLDivElement>;
  zoomOptions?: Partial<JuiZoomOptions>;
  onZoomRectChange?: (newZoomRect: ElementRect) => void;
};

type JuiWithZoomProps = Pick<JuiZoomProps, 'transform'> & {
  zoomIn: (zoomCenter?: Point) => void;
  zoomOut: (zoomCenter?: Point) => void;
};

type JuiZoomState = {
  zoomRect: ElementRect;
};

type JuiZoomOptions = {
  accuracy: number;
  step: number;
  minScale: number;
  maxScale: number;
  wheel: boolean;
};

const DEFAULT_OPTIONS: JuiZoomOptions = {
  accuracy: 2,
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
    this.throttleZoom = throttle(this.zoomStep.bind(this), 50, {
      leading: true,
    });
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

  zoomStep = (scaleStep: number, zoomCenterPoint?: Point) => {
    const { scale } = this.props.transform;
    const newScale = scale + scaleStep;
    this.zoomTo(newScale, zoomCenterPoint);
  }

  zoomIn = () => {
    this.zoomStep(ensureOptions(this.props.zoomOptions).step);
  }

  zoomOut = () => {
    this.zoomStep(-ensureOptions(this.props.zoomOptions).step);
  }

  zoomTo = (newScale: number, zoomCenterPoint?: Point) => {
    const { scale, translateX, translateY } = this.props.transform;
    const { accuracy, maxScale, minScale } = ensureOptions(
      this.props.zoomOptions,
    );
    const fixNewScale = Number(newScale.toFixed(accuracy));
    if (
      (fixNewScale > scale && fixNewScale > maxScale) ||
      fixNewScale < minScale
    ) {
      return;
    }
    // fixNewScale = Math.max(minScale, Math.min(maxScale, fixNewScale));
    let translateOffsetX = 0;
    let translateOffsetY = 0;
    if (zoomCenterPoint) {
      const rect = this.getViewRef().current.getBoundingClientRect();
      const rectCenter = getCenterPoint(rect);
      translateOffsetX = zoomCenterPoint.left - rectCenter.left;
      translateOffsetY = zoomCenterPoint.top - rectCenter.top;
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

  throttleZoom(scaleStep: number, zoomCenterPoint?: Point) {
    this.zoomStep(scaleStep, zoomCenterPoint);
  }

  onWheel = (ev: React.WheelEvent) => {
    const { step, wheel } = ensureOptions(this.props.zoomOptions);
    if (!wheel) return;
    ev.preventDefault();
    const point: Point = {
      left: ev.pageX,
      top: ev.pageY,
    };
    if (ev.deltaY > 0) {
      this.throttleZoom(-step, point);
    } else if (ev.deltaY < -0) {
      this.throttleZoom(+step, point);
    }
  }

  render() {
    const { children, transform, onZoomRectChange } = this.props;
    const zoomProps: JuiWithZoomProps = {
      transform,
      zoomIn: this.zoomIn,
      zoomOut: this.zoomOut,
    };
    const divStyle = {
      transform: `scale(${transform.scale}) translate(${
        transform.translateX
      }px, ${transform.translateY}px)`,
    };
    return (
      <Container ref={this.getViewRef()}>
        <div style={divStyle} onWheel={this.onWheel}>
          {children(zoomProps)}
        </div>
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
