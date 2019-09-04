/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:55
 * Copyright © RingCentral. All rights reserved.
 */
import { HotKeys } from 'jui/hoc/HotKeys';
import { JuiDragZoom } from 'jui/pattern/DragZoom';
import {
  JuiImageViewerContainer,
  JuiImageViewerForwardButton,
  JuiImageViewerPreviousButton,
} from 'jui/pattern/ImageViewer';
import { observer } from 'mobx-react';
import React, { Component, createRef, RefObject } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Notification } from '@/containers/Notification';
import { DialogContext } from '@/containers/Dialog';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ImageViewerViewProps } from './types';
import { JuiZoomElement, ZoomElementAnimation } from 'jui/components/Animation';
import ViewerContext from '../../container/ViewerView/ViewerContext';
import { JuiImageView } from 'jui/components/ImageView';
import { memoizeColor } from '@/common/memoizeFunction';
import { accelerateURL } from '@/common/accelerateURL';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { VIEWER_PERFORMANCE_KEYS } from '@/modules/viewer/performanceKeys';

type ImageViewerProps = WithTranslation & ImageViewerViewProps;

@observer
class ImageViewerComponent extends Component<ImageViewerProps, any> {
  private _performanceTracer: PerformanceTracer;
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  private _zoomRef: RefObject<JuiDragZoom> = createRef();
  private _animateRef: RefObject<ZoomElementAnimation> = createRef();
  static contextType = DialogContext;
  constructor(props: ImageViewerProps) {
    super(props);
    props.dataModule.setOnCurrentItemDeletedCb &&
      props.dataModule.setOnCurrentItemDeletedCb(this.onCurrentItemDeleted);
    props.dataModule.setOnImageSwitchCb &&
      props.dataModule.setOnImageSwitchCb(this._onImageSwitch);
    this.state = {
      switched: false,
      imageInited: false,
    };
  }

  async componentDidMount() {
    const { init } = this.props.dataModule;
    init && (await init());
  }

  switchPreImage = () => {
    if (this._canSwitchPrevious()) {
      this._zoomRef.current!.reset();
      this.props.dataModule.switchToPrevious();
      if (!this.state.switched) {
        this.setState({ switched: true });
      }
    }
  };

  switchNextImage = () => {
    if (this._canSwitchNext()) {
      this._zoomRef.current!.reset();
      this.props.dataModule.switchToNext();
      if (!this.state.switched) {
        this.setState({ switched: true });
      }
    }
  };

  onCurrentItemDeleted = (nextItemId: number) => {
    const { t, deleteItem } = this.props;
    if (deleteItem) {
      if (nextItemId === -1) {
        // use to close dialog
        this.context();
      }
      return;
    }

    mainLogger.tags('ImageViewer').info('onCurrentItemDeleted');
    Notification.flashToast({
      message: t('viewer.ImageDeleted'),
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
    this.context();
  };

  private _onImageSwitch = (imgInfo: { width: number; height: number }) => {
    if (imgInfo.width && imgInfo.height && this._zoomRef.current) {
      this._zoomRef.current.updateContentSize(imgInfo.width, imgInfo.height);
    }
  };

  private _onZoomImageContentChange = () => {
    if (!this.state.imageInited) {
      this.setState({
        imageInited: true,
      });
    }
  };

  private _canSwitchPrevious = () => {
    const { hasPrevious, isLoadingMore } = this.props.dataModule;
    return !isLoadingMore && hasPrevious;
  };

  private _canSwitchNext = () => {
    const { hasNext, isLoadingMore } = this.props.dataModule;
    return !isLoadingMore && hasNext;
  };

  performanceTracerStart = () => {
    this._performanceTracer = PerformanceTracer.start();
  };

  performanceTracerEnd = () => {
    this._performanceTracer &&
      this._performanceTracer.end({
        key: VIEWER_PERFORMANCE_KEYS.UI_IMAGE_VIEWER_IMAGE_RENDER,
        infos: this.props.dataModule.currentItemId,
      });
  };

  render() {
    const { dataModule, t } = this.props;
    const {
      pages,
      thumbnailSrc,
      originElement,
      imageWidth,
      imageHeight,
      currentItemId,
      hasPrevious,
      hasNext,
    } = dataModule;
    const page = pages && pages[0];
    const padding = 32;
    return (
      <ViewerContext.Consumer>
        {value => (
          <>
            <HotKeys
              keyMap={{
                left: this.switchPreImage,
                right: this.switchNextImage,
              }}
            >
              <JuiImageViewerContainer>
                <JuiDragZoom
                  ref={this._zoomRef}
                  contentRef={this._imageRef}
                  options={{
                    minPixel: 10,
                    maxPixel: 20000,
                    step: 0.1,
                    wheel: true,
                    padding: [padding, padding, padding, padding],
                  }}
                  zoomInText={t('viewer.ZoomIn')}
                  zoomOutText={t('viewer.ZoomOut')}
                  zoomResetText={t('viewer.ZoomReset')}
                  onAutoFitContentRectChange={this._onZoomImageContentChange}
                >
                  {({
                    fitWidth,
                    fitHeight,
                    notifyContentSizeChange,
                    canDrag,
                    transform,
                  }) => {
                    const imageStyle = {
                      opacity: value.isAnimating && value.show ? 0 : undefined,
                      transform: `scale(${transform.scale}) translate(${
                        transform.translateX
                      }px, ${transform.translateY}px)`,
                      cursor: canDrag ? 'move' : undefined,
                    };
                    return (
                      <JuiImageView
                        data-test-automation-id={'previewerCanvas'}
                        key={`image-${currentItemId}`}
                        performanceTracerStart={this.performanceTracerStart}
                        performanceTracerEnd={this.performanceTracerEnd}
                        imageRef={this._imageRef}
                        src={accelerateURL(page && page.url)}
                        width={fitWidth || imageWidth}
                        height={fitHeight || imageHeight}
                        style={imageStyle}
                        onSizeLoad={notifyContentSizeChange}
                        onLoad={value.onContentLoad}
                        onError={value.onContentError}
                        thumbnailSrc={thumbnailSrc}
                      />
                    );
                  }}
                </JuiDragZoom>
                {hasPrevious && (
                  <JuiImageViewerPreviousButton
                    className="buttonWrapper"
                    tooltipTitle={t('viewer.PreviousFile')}
                    aria-label={t('viewer.PreviousFile')}
                    onClick={this.switchPreImage}
                    iconName="previous"
                    iconColor={memoizeColor('grey', '900')}
                  />
                )}
                {hasNext && (
                  <JuiImageViewerForwardButton
                    className="buttonWrapper"
                    tooltipTitle={t('viewer.NextFile')}
                    aria-label={t('viewer.NextFile')}
                    onClick={this.switchNextImage}
                    iconName="forward"
                    iconColor={memoizeColor('grey', '900')}
                  />
                )}
              </JuiImageViewerContainer>
            </HotKeys>
            {this._imageRef.current && this.state.imageInited && (
              <JuiZoomElement
                ref={this._animateRef}
                originalElement={
                  this.state.switched ? null : originElement || null
                }
                targetElement={this._imageRef.current}
                show={value.show}
                duration="standard"
                easing="sharp"
                onEntered={value.onTransitionEntered}
                onExited={value.onTransitionExited}
              />
            )}
          </>
        )}
      </ViewerContext.Consumer>
    );
  }
}

const ImageViewerView = withTranslation('translations')(ImageViewerComponent);

export { ImageViewerView };
