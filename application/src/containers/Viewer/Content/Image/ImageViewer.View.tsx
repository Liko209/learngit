/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:55
 * Copyright © RingCentral. All rights reserved.
 */
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
import { withTranslation, WithTranslation } from 'react-i18next';
import { Notification } from '@/containers/Notification';
import { DialogContext } from '@/containers/Dialog';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ImageViewerViewProps } from './types';
import { JuiZoomElement, ZoomElementAnimation } from 'jui/components/Animation';
import ViewerContext from '../../ViewerContext';
import { JuiImageView } from 'jui/components/ImageView';
import { memoizeColor } from '@/common/memoizeFunction';

type ImageViewerProps = WithTranslation & ImageViewerViewProps & ThemeProps;

@observer
class ImageViewerComponent extends Component<ImageViewerProps, any> {
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  private _zoomRef: RefObject<JuiDragZoom> = createRef();
  private _animateRef: RefObject<ZoomElementAnimation> = createRef();
  static contextType = DialogContext;
  constructor(props: ImageViewerProps) {
    super(props);
    props.setOnCurrentItemDeletedCb(this.onCurrentItemDeleted);
    this.state = {
      initialOptions: this.props.initialOptions,
      switched: false,
      imageInited: false,
    };
  }

  _handlerKeydown = (event: KeyboardEvent) => {
    // 107 Num Key  +
    // 109 Num Key  -
    // 173 Min Key  hyphen/underscor Hey
    // 61 Plus key  +/= key
    if (
      event.ctrlKey &&
      (event.which === 61 ||
        event.which === 107 ||
        event.which === 173 ||
        event.which === 109 ||
        event.which === 187 ||
        event.which === 189)
    ) {
      event.preventDefault();
    }
  }

  _handlerScroll = (event: MouseEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this._handlerKeydown, {
      passive: false,
    });
    ['DOMMouseScroll', 'mousewheel'].forEach((v: string) => {
      window.addEventListener(v, this._handlerScroll, {
        passive: false,
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this._handlerKeydown);
    ['DOMMouseScroll', 'mousewheel'].forEach((v: string) => {
      window.removeEventListener(v, this._handlerScroll);
    });
  }

  switchPreImage = () => {
    if (this._canSwitchPrevious()) {
      this._zoomRef.current!.reset();
      this.props.switchToPrevious();
      if (!this.state.switched) {
        this.setState({ switched: true });
      }
    }
  }

  switchNextImage = () => {
    if (this._canSwitchNext()) {
      this._zoomRef.current!.reset();
      this.props.switchToNext();
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

  private _onZoomImageContentChange = () => {
    if (!this.state.imageInited) {
      this.setState({
        imageInited: true,
      });
    }
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
      currentItemId,
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
                  onAutoFitContentRectChange={this._onZoomImageContentChange}
                >
                  {({
                    fitWidth,
                    fitHeight,
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
                        data-test-automation-id={'previewerCanvas'}
                        key={`image-${currentItemId}`}
                        imageRef={this._imageRef}
                        src={imageUrl}
                        width={fitWidth || imageWidth}
                        height={fitHeight || imageHeight}
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
                  this.state.switched
                    ? null
                    : this.props.initialOptions.originElement!
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

const ImageViewerView = withTheme(
  withTranslation('translations')(ImageViewerComponent),
);

export { ImageViewerView };
