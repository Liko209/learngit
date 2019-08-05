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
  JuiZoomComponent,
  Transform,
} from '../../components/ZoomArea';
import styled from '../../foundation/styled-components';
import { height } from '../../foundation/utils/styles';
import { JuiFabGroup } from '../ImageViewer';
import { JuiDragZoomChildrenProps, JuiDragZoomOptions } from './types';
import {
  calculateFitWidthHeight,
  calculateFitWidthHeightByFixedContainer,
  fixBoundary,
  isDraggable,
} from './utils';

type JuiDragZoomProps = {
  zoomInText?: string;
  zoomOutText?: string;
  zoomResetText?: string;
  zoomRef?: RefObject<JuiZoomComponent>;
  contentRef?: RefObject<any>;
  options?: Partial<JuiDragZoomOptions>;
  onAutoFitContentRectChange?: (fitWidth: number, fitHeight: number) => void;
  onTransformChange?: (info: {
    transform: Transform;
    canDrag: boolean;
  }) => void;
  children: (withDragZoomProps: JuiDragZoomChildrenProps) => any;
  applyTransform?: boolean;
  fixedContainer?: boolean;
  transFormInCenter?: boolean;
  unNeedZoomButtonGroup?: boolean;
  containerSize?: number;
};

type JuiDragZoomState = {
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
  private _contentWidth?: number;
  private _contentHeight?: number;
  private _containerWidth?: number;
  private _containerHeight?: number;
  private _fitWidth?: number;
  private _fitHeight?: number;

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
      minScale: ensureOptions(this.props.options).minScale || 0,
      maxScale: ensureOptions(this.props.options).maxScale || Number.MAX_VALUE,
    };
  }

  getZoomRef(): RefObject<JuiZoomComponent> {
    return this.props.zoomRef || this._zoomRef;
  }

  getContentRef(): RefObject<any> {
    return this.props.contentRef || this._contentRef;
  }

  canZoomIn = () => this.state.canZoomIn;

  canZoomOut = () => this.state.canZoomOut;

  reset = () => {
    this.getZoomRef().current!.reset();
  };

  updateContentSize = (contentWidth: number, contentHeight: number) => {
    this._contentWidth = contentWidth;
    this._contentHeight = contentHeight;
    this.updateRect();
  };

  updateRect = () => {
    const { fixedContainer, containerSize } = this.props;
    if (
      this._contentHeight &&
      this._contentWidth &&
      this._containerWidth &&
      this._containerHeight
    ) {
      const [fitWidth, fitHeight] = fixedContainer
        ? calculateFitWidthHeightByFixedContainer(
            this._contentWidth,
            this._contentHeight,
            containerSize,
            ensureOptions(this.props.options).padding,
          )
        : calculateFitWidthHeight(
            this._contentWidth,
            this._contentHeight,
            this._containerWidth,
            this._containerHeight,
            ensureOptions(this.props.options).padding,
          );
      if (this._fitWidth !== fitWidth || this._fitHeight !== fitHeight) {
        this.applyNewTransform({
          scale: 1,
          translateX: 0,
          translateY: 0,
        });
        this._onAutoFitContentRectChange(fitWidth, fitHeight);
        const canDrag = isDraggable(
          fitWidth,
          fitHeight,
          this._containerWidth,
          this._containerHeight,
        );
        this.setState({
          canDrag,
        });
      }
    }
  };
  /* eslint-disable react/no-access-state-in-setstate */
  applyNewTransform = (newTransform: Transform) => {
    let transform = newTransform;
    let canDrag = this.state.canDrag;
    if (
      this._fitWidth &&
      this._fitHeight &&
      this._containerWidth &&
      this._containerHeight
    ) {
      const [newWidth, newHeight] = [
        this._fitWidth * transform.scale,
        this._fitHeight * transform.scale,
      ];
      transform = fixBoundary(
        transform,
        this._fitWidth,
        this._fitHeight,
        this._containerWidth,
        this._containerHeight,
      );
      canDrag = isDraggable(
        newWidth,
        newHeight,
        this._containerWidth,
        this._containerHeight,
      );
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
  };

  onTransformChange = (info: { transform: Transform; canDrag: boolean }) => {
    this.setState({
      transform: info.transform,
    });
  };

  private _onAutoFitContentRectChange = (
    fitWidth: number,
    fitHeight: number,
  ) => {
    if (!this.props.options) return;
    const { minPixel, maxPixel } = this.props.options;
    this._updateScale(fitWidth, fitHeight, minPixel, maxPixel);
    this._fitWidth = fitWidth;
    this._fitHeight = fitHeight;
    this.props.onAutoFitContentRectChange &&
      this.props.onAutoFitContentRectChange(fitWidth, fitHeight);
    this.forceUpdate();
  };

  private _updateScale(
    contentWidth: number,
    contentHeight: number,
    minPixel?: number,
    maxPixel?: number,
  ) {
    if (contentWidth > 0 && contentHeight > 0) {
      minPixel &&
        this.setState({
          minScale: minPixel / Math.min(contentWidth, contentHeight),
        });
      maxPixel &&
        this.setState({
          maxScale: maxPixel / Math.max(contentWidth, contentHeight),
        });
    }
  }

  private _updateZoomRect(zoomRect: ElementRect) {
    this._containerWidth = zoomRect.width;
    this._containerHeight = zoomRect.height;
    this.updateRect();
  }

  render() {
    const {
      options,
      zoomInText,
      zoomOutText,
      zoomResetText,
      applyTransform,
      transFormInCenter,
      unNeedZoomButtonGroup,
      children,
    } = this.props;
    const { transform, canDrag } = this.state;
    const { minPixel, maxPixel, step, ...zoomOptions } = ensureOptions(options);

    const {
      minScale = zoomOptions.minScale,
      maxScale = zoomOptions.maxScale,
    } = this.state;
    return (
      <Container ref={this._containerRef}>
        <JuiZoomComponent
          ref={this.getZoomRef()}
          applyTransform={applyTransform}
          transFormInCenter={transFormInCenter}
          zoomOptions={{ ...zoomOptions, minScale, maxScale }}
          transform={transform}
          onTransformChange={(transform: Transform) => {
            this.applyNewTransform(transform);
          }}
          onZoomRectChange={(zoomRect: ElementRect) => {
            this._updateZoomRect(zoomRect);
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
                    canDrag,
                    isDragging,
                    transform,
                    fitWidth: this._fitWidth,
                    fitHeight: this._fitHeight,
                    notifyContentSizeChange: this.updateContentSize,
                  }),
                  {
                    ref: this._contentRef,
                  },
                )
              }
            </DragArea>
          )}
        </JuiZoomComponent>
        {!unNeedZoomButtonGroup && (
          <ZoomButtonGroup
            className="zoomGroup"
            resetMode={transform.scale !== 1}
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
            ZoomReset={
              <JuiIconButton
                variant="plain"
                tooltipTitle={zoomResetText}
                ariaLabel={zoomResetText}
                disabled={transform.scale === 1}
                onClick={() => {
                  this.getZoomRef().current!.reset();
                }}
              >
                reset_zoom
              </JuiIconButton>
            }
          />
        )}
      </Container>
    );
  }
}

export {
  JuiDragZoom,
  JuiDragZoomProps,
  ZoomButtonGroup as JuiZoomButtonGroup,
  JuiDragZoomChildrenProps as JuiWithDragZoomProps,
  JuiDragZoomOptions,
  DEFAULT_DRAG_ZOOM_OPTIONS as DEFAULT_OPTIONS,
};
