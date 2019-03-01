/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:18
 * Copyright © RingCentral. All rights reserved.
 */
import _, { throttle } from 'lodash';
import React, { RefObject } from 'react';
import ReactResizeDetector from 'react-resize-detector';

import styled from '../../foundation/styled-components';
import {
  ElementRect,
  Point,
  Transform,
} from '../../foundation/utils/calculateZoom';
import { Omit } from '../../foundation/utils/typeHelper';

type ZoomProps = {
  transform: Transform;
  onTransformChange: (newTransform: Transform) => void;
  children: (withZoomProps: WithZoomProps) => JSX.Element;
  viewRef?: RefObject<HTMLDivElement>;
  zoomOptions?: Partial<ZoomOptions>;
  onZoomRectChange?: (newZoomRect: ElementRect) => void;
};

type WithZoomProps = Pick<ZoomProps, 'transform'> & {
  zoomIn: (zoomCenter?: Point) => void;
  zoomOut: (zoomCenter?: Point) => void;
};

type ZoomState = {
  zoomRect: ElementRect;
};

type ZoomOptions = {
  accuracy: number;
  step: number;
  minScale: number;
  maxScale: number;
  wheel: boolean;
};

const DEFAULT_OPTIONS: ZoomOptions = {
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

function ensureOptions(zoomOptions?: Partial<ZoomOptions>): ZoomOptions {
  return zoomOptions
    ? {
      ...DEFAULT_OPTIONS,
      ...zoomOptions,
    }
    : DEFAULT_OPTIONS;
}

function getCenterPoint(react: ElementRect) {
  return {
    left: react.left + react.width / 2,
    top: react.top + react.height / 2,
  };
}

function fixScaleAccuracy(scale: number, accuracy: number): number {
  return Number(scale.toFixed(accuracy));
}

class ZoomComponent extends React.Component<ZoomProps, ZoomState> {
  private _viewRef: RefObject<HTMLDivElement> = React.createRef();

  constructor(props: ZoomProps) {
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

  zoomTo = (newScale: number, zoomCenterPoint?: Point) => {
    const { scale, translateX, translateY } = this.props.transform;
    const { accuracy, maxScale, minScale } = ensureOptions(
      this.props.zoomOptions,
    );
    const fixNewScale = fixScaleAccuracy(newScale, accuracy);
    if (
      (fixNewScale > scale && fixNewScale > maxScale) ||
      (fixNewScale < minScale)
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
    const zoomProps: WithZoomProps = {
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

class ZoomArea extends React.Component<
  Omit<ZoomProps, 'transform' | 'onTransformChange'>,
  { transform: Transform }
> {
  constructor(props: Omit<ZoomProps, 'transform' | 'onTransformChange'>) {
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
    return React.createElement(ZoomComponent, {
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
  WithZoomProps,
  ZoomProps,
  ZoomComponent,
  ZoomArea,
  ZoomOptions,
  DEFAULT_OPTIONS,
};
