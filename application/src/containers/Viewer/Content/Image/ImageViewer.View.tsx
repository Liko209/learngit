/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:55
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiIconography } from 'jui/foundation/Iconography';
import { withTheme } from 'jui/foundation/styled-components';
import { ThemeProps } from 'jui/foundation/theme/theme';
import { HotKeys } from 'jui/hoc/HotKeys';
import { JuiDragZoom } from 'jui/pattern/DragZoom';
import {
  JuiImageViewerContainer,
  JuiImageViewerForwardButton,
  JuiImageViewerPreviousButton,
} from 'jui/pattern/ImageViewer';
import { observer } from 'mobx-react';
import React, { Component, createRef, RefObject } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { Notification } from '@/containers/Notification';
import { DialogContext } from '@/containers/Dialog';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ImageViewerViewProps } from './types';
import { JuiZoomElement } from 'jui/components/Animation';
import ViewerContext from '../../ViewerContext';
import { JuiImageView } from 'jui/components/ImageView';

type ImageViewerProps = WithNamespaces & ImageViewerViewProps & ThemeProps;

@observer
class ImageViewerComponent extends Component<ImageViewerProps, any> {
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  private _zoomRef: RefObject<JuiDragZoom> = createRef();
  static contextType = DialogContext;
  constructor(props: ImageViewerProps) {
    super(props);
    props.setOnCurrentItemDeletedCb(this.onCurrentItemDeleted);
    this.state = {
      initialOptions: this.props.initialOptions,
      switched: false,
    };
  }

  switchPreImage = () => {
    if (this._canSwitchPrevious()) {
      this._zoomRef.current!.reset();
      this.props.switchPreImage();
      if (!this.state.switched) {
        this.setState({ switched: true });
      }
    }
  }

  switchNextImage = () => {
    if (this._canSwitchNext()) {
      this._zoomRef.current!.reset();
      this.props.switchNextImage();
      if (!this.state.switched) {
        this.setState({ switched: true });
      }
    }
  }

  onCurrentItemDeleted = () => {
    const { t } = this.props;
    Notification.flashToast({
      message: t('viewer.DismissTip'),
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
    this.context();
  }

  private _canSwitchPrevious = () => {
    const { hasPrevious, isLoadingMore } = this.props;
    return !isLoadingMore && hasPrevious;
  }

  private _canSwitchNext = () => {
    const { hasNext, isLoadingMore } = this.props;
    return !isLoadingMore && hasNext;
  }

  render() {
    const {
      imageUrl,
      theme,
      t,
      thumbnailSrc,
      imageWidth,
      imageHeight,
      hasPrevious,
      hasNext,
    } = this.props;
    const padding = theme.spacing.unit * 8;
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
                >
                  {({
                    autoFitContentRect,
                    notifyContentSizeChange,
                    canDrag,
                    isDragging,
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
                        imageRef={this._imageRef}
                        src={imageUrl}
                        width={
                          (autoFitContentRect && autoFitContentRect.width) ||
                          imageWidth
                        }
                        height={
                          (autoFitContentRect && autoFitContentRect.height) ||
                          imageHeight
                        }
                        style={imageStyle}
                        onSizeLoad={notifyContentSizeChange}
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
                  >
                    <JuiIconography color="grey.900">pervious</JuiIconography>
                  </JuiImageViewerPreviousButton>
                )}
                {hasNext && (
                  <JuiImageViewerForwardButton
                    className="buttonWrapper"
                    tooltipTitle={t('viewer.NextFile')}
                    aria-label={t('viewer.NextFile')}
                    onClick={this.switchNextImage}
                  >
                    <JuiIconography color="grey.900">forward</JuiIconography>
                  </JuiImageViewerForwardButton>
                )}
              </JuiImageViewerContainer>
            </HotKeys>
            {this._imageRef.current && (
              <JuiZoomElement
                originalElement={
                  this.state.switched
                    ? null
                    : this.props.initialOptions.originElement!
                }
                targetElement={this._imageRef.current}
                show={value.show}
                duration="standard"
                easing="openCloseDialog"
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

const ImageViewerView = withTheme(
  translate('translations')(ImageViewerComponent),
);

export { ImageViewerView };
