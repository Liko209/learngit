/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { createRef, createContext, ReactNode } from 'react';
import styled from 'src/foundation/styled-components';
import { spacing } from '../../../foundation/utils/styles';
import { applyTransform, applyInverseTransform } from '../ui_utils';

const DEFAULT_SCALE = 1;
const ViewerPageWrap = styled.div`
  && {
    font-size: 0;
    margin: -1px auto ${spacing(-4)} auto;
    position: relative;
    overflow: visible;
    border: ${spacing(4)} solid transparent;
    box-sizing: content-box;
    padding: 0;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ViewerPageContentWrap = styled.div`
  && {
    overflow: hidden;
    box-shadow: ${props => props.theme.shadows[8]};
  }
`;

type ScaleType = number;

type ViewportType = {
  width: number;
  height: number;
};

type RenderParamsType = {
  width: number;
  height: number;
  transforms?: number[];
  viewBox?: ViewBoxType;
  selfScale?: boolean;
};

type ViewBoxType = [
  number /* xMin */,
  number /* yMin */,
  number /* xMax */,
  number /* yMax */
];

type Props = {
  pageNumber?: number;
  scale?: ScaleType;
  loading?: ReactNode;
  getViewport?: () => ViewportType;
  ref?: (ref: any) => void;
  children?: React.ReactNode;
};

type States = {
  currentScale: ScaleType;
  originViewPort: ViewportType | null;
  currentViewPort: ViewportType | null;
};

class JuiViewerPage extends React.Component<Props, States> {
  container = createRef<HTMLDivElement>();
  contentWrap = createRef<HTMLDivElement>();

  viewport: PageViewport;

  state: States = {
    currentScale: DEFAULT_SCALE,
    originViewPort: null,
    currentViewPort: null,
  };

  componentWillMount() {
    const { getViewport } = this.props;
    const viewport = getViewport && getViewport();
    if (viewport) {
      this.setState(
        {
          currentViewPort: viewport,
          originViewPort: viewport,
        },
        () => {
          this._createViewport();
          this._reset();
          this._initialScale();
        },
      );
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { scale } = nextProps;
    if (
      scale !== undefined &&
      this.props.scale !== scale &&
      this.state.currentScale !== scale
    ) {
      this._updateByScale(scale);
    }
  }

  private _createViewport = () => {
    const { originViewPort } = this.state;
    let xMax = 0;
    let yMax = 0;
    if (originViewPort) {
      xMax = originViewPort.width;
      yMax = originViewPort.height;
    }

    const viewBox: ViewBoxType = [0, 0, xMax, yMax];

    this.viewport = new PageViewport({
      viewBox,
      scale: this.state.currentScale,
      rotation: 0,
    });
  }

  private _initialScale = () => {
    const { scale } = this.props;
    const _scale = scale ? (scale > 0 ? scale : DEFAULT_SCALE) : DEFAULT_SCALE;
    this._updateByScale(_scale);
  }

  private _updateByScale(scale: ScaleType) {
    this.viewport = this.viewport.clone({
      scale,
    });

    this.setState({
      currentScale: scale,
    });

    const renderParams = this._getRenderParams();

    const container = this.container.current;
    const contentWrapEl = this.contentWrap.current;
    if (
      renderParams &&
      container &&
      contentWrapEl &&
      typeof scale === 'number'
    ) {
      const { width, height, selfScale } = renderParams;
      let newWidth = 0;
      let newHeight = 0;

      if (width) {
        newWidth = width * scale;
        container.style.width = !selfScale ? `${newWidth}px` : `${width}px`;
        contentWrapEl.style.width = !selfScale ? `${newWidth}px` : `${width}px`;
      }
      if (height) {
        newHeight = height * scale;
        container.style.height = !selfScale ? `${newHeight}px` : `${height}px`;
        contentWrapEl.style.height = !selfScale
          ? `${newHeight}px`
          : `${height}px`;
      }

      const newViewport = {
        width: newWidth,
        height: newHeight,
      };

      this.setState({
        currentViewPort: newViewport,
      });
    }
  }

  private _reset = () => {
    const containerEl = this.container.current;
    const contentWrapEl = this.contentWrap.current;
    const { currentViewPort: viewport } = this.state;

    if (containerEl && contentWrapEl && viewport) {
      containerEl.style.width = `${Math.floor(viewport.width)}px`;
      containerEl.style.height = `${Math.floor(viewport.height)}px`;
      contentWrapEl.style.width = `${Math.floor(viewport.width)}px`;
      contentWrapEl.style.height = `${Math.floor(viewport.height)}px`;
    }
  }

  private _getRenderParams = (): RenderParamsType => {
    const { getViewport } = this.props;
    const { originViewPort } = this.state;
    const viewport = getViewport && getViewport();

    if (viewport) {
      const { width: newWidth, height: newHeight } = viewport;
      if (originViewPort) {
        const { width: originWidth, height: originHeight } = originViewPort;
        if (newWidth !== originWidth || newHeight !== originHeight) {
          return {
            width: newWidth,
            height: newHeight,
            selfScale: true,
          };
        }

        return {
          width: originWidth,
          height: originHeight,
          selfScale: false,
        };
      }
      return {
        width: newWidth,
        height: newHeight,
        selfScale: false,
      };
    }

    return {
      width: 0,
      height: 0,
      selfScale: false,
    };
  }

  get childContext() {
    const { currentScale } = this.state;
    return {
      scale: currentScale,
    };
  }

  get currentViewport(): ViewportType | null {
    return this.state.currentViewPort;
  }

  get originViewport(): ViewportType | null {
    return this.state.originViewPort;
  }

  getViewport() {
    return this.viewport;
  }

  getPagePoint(x: number, y: number) {
    return this.viewport && this.viewport.convertToPagePoint(x, y);
  }

  renderContent() {
    const { children, loading } = this.props;

    if (!children || loading) {
      return loading;
    }

    return (
      <PageContext.Provider value={this.childContext}>
        {children}
      </PageContext.Provider>
    );
  }

  render() {
    const { pageNumber, ...rest } = this.props;
    const content = this.renderContent();
    if (!content) {
      return null;
    }
    return (
      <ViewerPageWrap
        className="ViewerPage"
        data-page-index={pageNumber}
        ref={this.container as any}
        {...rest}
      >
        <ViewerPageContentWrap
          className="ViewerPageContentWrap"
          ref={this.contentWrap as any}
        >
          {content}
        </ViewerPageContentWrap>
      </ViewerPageWrap>
    );
  }
}

const PageContext = createContext<Props>({});

export { JuiViewerPage, Props as JuiViewerPageProps, PageContext };

type PageViewportParam = {
  viewBox: ViewBoxType;
  scale: number;
  rotation: number;
  offsetX?: number;
  offsetY?: number;
  dontFlip?: boolean;
};

class PageViewport {
  viewBox: ViewBoxType;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  transform: number[];
  width: number;
  height: number;

  constructor({
    viewBox,
    scale,
    rotation,
    offsetX = 0,
    offsetY = 0,
    dontFlip = false,
  }: PageViewportParam) {
    this.viewBox = viewBox;
    this.scale = scale;
    this.rotation = rotation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    const centerX = (viewBox[2] + viewBox[0]) / 2;
    const centerY = (viewBox[3] + viewBox[1]) / 2;
    // tslint:disable-next-line: one-variable-per-declaration
    let rotateA, rotateB, rotateC, rotateD;
    // tslint:disable-next-line: no-parameter-reassignment
    rotation = rotation % 360;
    // tslint:disable-next-line: no-parameter-reassignment
    rotation = rotation < 0 ? rotation + 360 : rotation;
    switch (rotation) {
      case 180:
        rotateA = -1;
        rotateB = 0;
        rotateC = 0;
        rotateD = 1;
        break;
      case 90:
        rotateA = 0;
        rotateB = 1;
        rotateC = 1;
        rotateD = 0;
        break;
      case 270:
        rotateA = 0;
        rotateB = -1;
        rotateC = -1;
        rotateD = 0;
        break;
      // case 0:
      default:
        rotateA = 1;
        rotateB = 0;
        rotateC = 0;
        rotateD = -1;
        break;
    }

    if (dontFlip) {
      rotateC = -rotateC;
      rotateD = -rotateD;
    }

    // tslint:disable-next-line: one-variable-per-declaration
    let offsetCanvasX, offsetCanvasY;
    // tslint:disable-next-line: one-variable-per-declaration
    let width, height;
    if (rotateA === 0) {
      offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;
      width = Math.abs(viewBox[3] - viewBox[1]) * scale;
      height = Math.abs(viewBox[2] - viewBox[0]) * scale;
    } else {
      offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;
      width = Math.abs(viewBox[2] - viewBox[0]) * scale;
      height = Math.abs(viewBox[3] - viewBox[1]) * scale;
    }

    this.transform = [
      rotateA * scale,
      rotateB * scale,
      rotateC * scale,
      rotateD * scale,
      offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
      offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY,
    ];

    this.width = width;
    this.height = height;
  }

  clone({
    scale = this.scale,
    rotation = this.rotation,
    dontFlip = false,
  } = {}) {
    return new PageViewport({
      scale,
      rotation,
      dontFlip,
      viewBox: this.viewBox.slice() as ViewBoxType,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    });
  }

  convertToViewportPoint(x: number, y: number) {
    return applyTransform([x, y], this.transform);
  }

  convertToPagePoint(x: number, y: number) {
    return applyInverseTransform([x, y], this.transform);
  }
}
