/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiDragZoom } from 'jui/pattern/DragZoom';
import { JuiImageView } from 'jui/components/ImageView';
import { JuiModal } from 'jui/components/Dialog';
import { RuiSlider } from 'rcui/components/Forms/Slider';
import { JuiButton } from 'jui/components/Buttons';
import {
  JuiEditPhotoUploadContent,
  JuiEditPhotoImageContent,
  JuiEditPhotoSliderContent,
  JuiEditPhotoSliderLeftText,
} from 'jui/pattern/EditProfile';
import { accelerateURL } from '@/common/accelerateURL';
import portalManager from '@/common/PortalManager';
import { PhotoEditViewModelProps, PhotoEditProps } from './types';

@observer
class PhotoEditComponent extends Component<
  PhotoEditViewModelProps & PhotoEditProps & WithTranslation
> {
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  private _zoomRef: RefObject<JuiDragZoom> = createRef();

  handleClose = () => portalManager.dismissLast();

  renderZoomContainer = () => {
    const { t } = this.props;
    return (
      <JuiDragZoom
        ref={this._zoomRef}
        contentRef={this._imageRef}
        options={{
          minPixel: 10,
          maxPixel: 20000,
          step: 0.1,
          wheel: true,
          padding: [10, 10, 10, 10],
        }}
        zoomInText={t('viewer.ZoomIn')}
        zoomOutText={t('viewer.ZoomOut')}
        zoomResetText={t('viewer.ZoomReset')}
        onAutoFitContentRectChange={() => {}}
      >
        {({
          fitWidth,
          fitHeight,
          notifyContentSizeChange,
          canDrag,
          transform,
        }) => {
          const imageStyle = {
            opacity: 1,
            transform: `scale(${transform.scale}) translate(${
              transform.translateX
            }px, ${transform.translateY}px)`,
            cursor: canDrag ? 'move' : undefined,
          };
          return (
            <JuiImageView
              data-test-automation-id={'previewerCanvas'}
              imageRef={this._imageRef}
              src={accelerateURL(
                'https://glip-vault-1.s3-accelerate.amazonaws.com/web/customer_files/1316652318732/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAJROPQDFTIHBTLJJQ&Signature=uPTq8YQJisMS%2F2kPCyoQISwB%2Fs0%3D',
              )}
              width={fitWidth || 0}
              height={fitHeight || 0}
              style={imageStyle}
              onSizeLoad={notifyContentSizeChange}
            />
          );
        }}
      </JuiDragZoom>
    );
  };

  render() {
    const {
      t,
      id,
      webpageError,
      isLoading,
      updateScale,
      currentScale,
    } = this.props;
    console.log('looper', id);
    return (
      <JuiModal
        open
        size={'medium'}
        title={t('people.profile.edit.editProfilePhotoTitle')}
        onCancel={this.handleClose}
        onOK={() => {}}
        okBtnProps={{
          disabled: webpageError,
        }}
        loading={isLoading}
        okText={t('common.dialog.done')}
        cancelText={t('common.dialog.cancel')}
        modalProps={{
          'data-test-automation-id': 'EditProfilePhoto',
        }}
      >
        <JuiEditPhotoUploadContent>
          <JuiButton variant="outlined" onClick={() => {}}>
            {t('people.profile.edit.editProfilePhotoUploadPhoto')}
          </JuiButton>
        </JuiEditPhotoUploadContent>
        <JuiEditPhotoImageContent>
          {this.renderZoomContainer()}
        </JuiEditPhotoImageContent>
        <JuiEditPhotoSliderContent>
          <JuiEditPhotoSliderLeftText>
            {t('people.profile.edit.editProfilePhotoZoomText')}
          </JuiEditPhotoSliderLeftText>
          <RuiSlider
            onChange={updateScale}
            min={1}
            max={5}
            step={0.01}
            value={currentScale}
            data-test-automation-id={'PhotoEditSlider'}
            aria-labelledby="input-slider"
          />
        </JuiEditPhotoSliderContent>
      </JuiModal>
    );
  }
}

const PhotoEditView = withTranslation('translations')(PhotoEditComponent);

export { PhotoEditView };
