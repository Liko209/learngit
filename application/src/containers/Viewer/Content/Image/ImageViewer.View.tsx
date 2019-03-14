/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:55
 * Copyright © RingCentral. All rights reserved.
 */
import { withTheme } from 'jui/foundation/styled-components';
import { ThemeProps } from 'jui/foundation/theme/theme';
import { HotKeys } from 'jui/hoc/HotKeys';
import { JuiDragZoomImage } from 'jui/pattern/DragZoom';
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

type ImageViewerProps = WithNamespaces & ImageViewerViewProps & ThemeProps;

@observer
class ImageViewerComponent extends Component<ImageViewerProps> {
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  static contextType = DialogContext;
  constructor(props: ImageViewerProps) {
    super(props);

    props.setOnCurrentItemDeletedCb(this.onCurrentItemDeleted);
  }

  switchPreImage = () => {
    this._canSwitchPrevious() && this.props.switchPreImage();
  }

  switchNextImage = () => {
    this._canSwitchNext() && this.props.switchNextImage();
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
    const { imageUrl, theme, t } = this.props;
    const padding = theme.spacing.unit * 8;
    return (
      <HotKeys
        keyMap={{
          left: this.switchPreImage,
          right: this.switchNextImage,
        }}
      >
        <JuiImageViewerContainer>
          <JuiDragZoomImage
            imageRef={this._imageRef}
            src={imageUrl}
            options={{
              minPixel: 10,
              maxPixel: 20000,
              step: 0.1,
              wheel: true,
              padding: [padding, padding, padding, padding],
            }}
            zoomInText={t('viewer.ZoomIn')}
            zoomOutText={t('viewer.ZoomOut')}
          />
          <JuiImageViewerPreviousButton
            className="buttonWrapper"
            tooltipTitle={t('viewer.PreviousFile')}
            aria-label={t('viewer.PreviousFile')}
            disabled={!this._canSwitchPrevious()}
            onClick={() => this.props.switchPreImage()}
            iconColor={['grey', '900']}
            iconName="previous"
          />
          <JuiImageViewerForwardButton
            className="buttonWrapper"
            tooltipTitle={t('viewer.NextFile')}
            aria-label={t('viewer.NextFile')}
            disabled={!this._canSwitchNext()}
            onClick={() => this.props.switchNextImage()}
            iconColor={['grey', '900']}
            iconName="forward"
          />
        </JuiImageViewerContainer>
      </HotKeys>
    );
  }
}

const ImageViewerView = withTheme(
  translate('translations')(ImageViewerComponent),
);

export { ImageViewerView };
