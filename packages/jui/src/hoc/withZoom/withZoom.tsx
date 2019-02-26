/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:18
 * Copyright © RingCentral. All rights reserved.
 */
import _, { throttle } from 'lodash';
import React, { RefObject } from 'react';

import styled from '../../foundation/styled-components';
import {
  ElementRect,
  Point,
  Transform,
} from '../../foundation/utils/calculateZoom';
import { Omit } from '../../foundation/utils/typeHelper';

type ZoomProps = {
  zoomOptions?: Partial<ZoomOptions>;
  transform: Transform;
  onTransformChange: (newTransform: Transform) => void;
  render: (withZoomProps: WithZoomProps) => JSX.Element;
};

type WithZoomProps = Pick<ZoomProps, 'transform'> & {
  zoomIn: (zoomCenter?: Point) => void;
  zoomOut: (zoomCenter?: Point) => void;
};

type ZoomState = {};

type ZoomOptions = {
  accuracy: number;
  step: number;
  wheel: boolean;
};

const DEFAULT_ZOOM_OPTIONS: ZoomOptions = {
  accuracy: 2,
  step: 0.1,
  wheel: false,
};

const Container = styled.div`
  position: relative;
  background: gray;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

function getCenterPoint(react: ElementRect) {
  return {
    left: react.left + react.width / 2,
    top: react.top + react.height / 2,
  };
}

function fixScaleAccuracy(scale: number, accuracy: number): number {
  return Number(scale.toFixed(accuracy));
}

function ensureZoomOption(zoomOptions?: Partial<ZoomOptions>): ZoomOptions {
  return zoomOptions
    ? {
      ...DEFAULT_ZOOM_OPTIONS,
      ...zoomOptions,
    }
    : DEFAULT_ZOOM_OPTIONS;
}

class ZoomComponent extends React.Component<ZoomProps> {
  private _zoomRef: RefObject<any> = React.createRef();

  constructor(props: ZoomProps) {
    super(props);
    this.throttleZoom = throttle(this.zoomStep.bind(this), 500);
  }

  zoomTo = (newScale: number, zoomCenterPoint?: Point) => {
    const { scale, translateX, translateY } = this.props.transform;
    const { accuracy } = ensureZoomOption(this.props.zoomOptions);
    const fixNewScale = fixScaleAccuracy(newScale, accuracy);
    let translateOffsetX = 0;
    let translateOffsetY = 0;
    if (zoomCenterPoint) {
      const rect = this._zoomRef.current.getBoundingClientRect();
      const rectCenter = getCenterPoint(rect);
      translateOffsetX = zoomCenterPoint.left - rectCenter.left;
      translateOffsetY = zoomCenterPoint.top - rectCenter.top;
    }
    this.props.onTransformChange({
      scale: fixNewScale,
      translateX: translateX - translateOffsetX * (fixNewScale / scale - 1),
      translateY: translateY - translateOffsetY * (fixNewScale / scale - 1),
    });
  }

  zoomStep = (scaleStep: number, zoomCenterPoint?: Point) => {
    const { scale } = this.props.transform;
    const newScale = scale + scaleStep;
    this.zoomTo(newScale, zoomCenterPoint);
  }

  throttleZoom(scaleStep: number, zoomCenterPoint?: Point) {
    this.zoomStep(scaleStep, zoomCenterPoint);
  }

  onWheel = (ev: React.WheelEvent) => {
    const { step, wheel } = ensureZoomOption(this.props.zoomOptions);
    if (!wheel) return;
    ev.preventDefault();
    const point: Point = {
      left: ev.pageX,
      top: ev.pageY,
    };
    if (ev.deltaY > 2) {
      this.throttleZoom(-step, point);
    } else if (ev.deltaY < -2) {
      this.throttleZoom(+step, point);
    }
  }

  render() {
    const { children, render, transform, ...rest } = this.props;
    const { step } = ensureZoomOption(this.props.zoomOptions);
    const zoomProps: WithZoomProps = {
      transform,
      zoomIn: this.zoomStep.bind(step),
      zoomOut: this.zoomStep.bind(-step),
    };
    return (
      <Container ref={this._zoomRef}>
        {React.cloneElement(render(zoomProps), {
          ...rest,
          onWheel: this.onWheel,
        })}
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

export { WithZoomProps, ZoomProps, ZoomComponent, ZoomArea };
