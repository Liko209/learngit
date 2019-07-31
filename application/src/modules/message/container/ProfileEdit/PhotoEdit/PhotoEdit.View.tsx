/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiDragZoom } from 'jui/pattern/DragZoom';
import { JuiImageView } from 'jui/components/ImageView';
import { JuiModal } from 'jui/components/Dialog';
import { RuiSlider } from 'rcui/components/Forms/Slider';
import { JuiButton } from 'jui/components/Buttons';
import { Avatar } from '@/containers/Avatar';

import {
  JuiEditPhotoUploadContent,
  JuiEditPhotoEditContent,
  JuiEditPhotoSliderContent,
  JuiEditPhotoSliderLeftText,
  JuiEditPhotoImageContent,
  JuiEditPhotoImageEditContent,
  JuiEditPhotoContentMask,
  JuiEditPhotoImageCanNotEdit,
} from 'jui/pattern/EditProfile';
import { accelerateURL } from '@/common/accelerateURL';
import { Transform } from 'jui/components/ZoomArea';
import portalManager from '@/common/PortalManager';
import { withUploadFile } from 'jui/hoc/withUploadFile';
import { PhotoEditViewModelProps, PhotoEditProps } from './types';

@withUploadFile
class UploadArea extends Component<any> {
  render() {
    return <div />;
  }
}
type PhotoEdit = PhotoEditViewModelProps & PhotoEditProps & WithTranslation;
@observer
class PhotoEditComponent extends Component<PhotoEdit> {
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  private _uploadRef: RefObject<any> = createRef();
  private _zoomRef: RefObject<JuiDragZoom> = createRef();

  constructor(props: PhotoEdit) {
    super(props);
    reaction(
      () => this.props.sliderValue,
      (scale: number) => {
        if (!this._zoomRef.current) return;
        const zoomComponentRef = this._zoomRef.current.getZoomRef();
        if (!zoomComponentRef || !zoomComponentRef.current) return;
        zoomComponentRef.current.zoomTo(scale);
      },
      {
        fireImmediately: true,
      },
    );
  }

  handleClose = () => portalManager.dismissLast();

  private _hideMenuAndShowDialog = () => {
    // for Edge bug: FIJI-2818
    setTimeout(() => {
      const ref = this._uploadRef.current;
      if (ref) {
        ref.showFileDialog();
      }
    }, 0);
  };

  handleTransformChange = ({
    transform,
  }: {
    transform: Transform;
    canDrag: boolean;
  }) => {
    this.props.updateTransform(transform);
  };

  onFileChanged = (files: FileList) => {
    const { updateImageUrl } = this.props;
    updateImageUrl(files[0]);
  };

  renderZoomContainer = () => {
    const { currentImageUrl, getInitSize } = this.props;
    return (
      <JuiDragZoom
        ref={this._zoomRef}
        contentRef={this._imageRef}
        options={{
          maxScale: 5,
          minScale: 1,
          step: 0.01,
          wheel: true,
        }}
        fixedContainer
        transFormInCenter
        unNeedZoomButtonGroup
        onTransformChange={this.handleTransformChange}
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
          const onSizeLoad = (contentWidth: number, contentHeight: number) => {
            getInitSize(contentWidth, contentHeight);
            notifyContentSizeChange(contentWidth, contentHeight);
          };
          return (
            <JuiEditPhotoImageContent canDrag={canDrag}>
              <JuiImageView
                data-test-automation-id={'previewerCanvas'}
                imageRef={this._imageRef}
                src={accelerateURL(currentImageUrl)}
                width={fitWidth || 0}
                height={fitHeight || 0}
                style={imageStyle}
                onSizeLoad={onSizeLoad}
              />
            </JuiEditPhotoImageContent>
          );
        }}
      </JuiDragZoom>
    );
  };

  render() {
    const {
      t,
      webpageError,
      isLoading,
      handleSliderChange,
      transform,
      shouldShowShortName,
      person,
      handleOk,
      isGifImage,
    } = this.props;
    return (
      <JuiModal
        open
        size={'medium'}
        title={t('people.profile.edit.editProfilePhotoTitle')}
        onCancel={this.handleClose}
        onOK={handleOk(this._imageRef)}
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
          <JuiButton variant="outlined" onClick={this._hideMenuAndShowDialog}>
            {t('people.profile.edit.editProfilePhotoUploadPhoto')}
          </JuiButton>
          <UploadArea
            onFileChanged={this.onFileChanged}
            multiple={false}
            ref={this._uploadRef}
            accept="image/*"
          />
        </JuiEditPhotoUploadContent>
        <JuiEditPhotoEditContent>
          <JuiEditPhotoContentMask />
          <JuiEditPhotoImageEditContent>
            {shouldShowShortName ? (
              <Avatar
                uid={person.id}
                size="xlarge"
                cover
                automationId="profileEditAvatar"
              />
            ) : isGifImage ? (
              <JuiEditPhotoImageCanNotEdit>
                {this.renderZoomContainer()}
              </JuiEditPhotoImageCanNotEdit>
            ) : (
              this.renderZoomContainer()
            )}
          </JuiEditPhotoImageEditContent>
        </JuiEditPhotoEditContent>
        {!shouldShowShortName && !isGifImage && (
          <JuiEditPhotoSliderContent>
            <JuiEditPhotoSliderLeftText>
              {t('people.profile.edit.editProfilePhotoZoomText')}
            </JuiEditPhotoSliderLeftText>
            <RuiSlider
              onChange={handleSliderChange}
              min={1}
              max={5}
              step={0.1}
              value={transform.scale}
              data-test-automation-id={'PhotoEditSlider'}
              aria-labelledby="input-slider"
            />
          </JuiEditPhotoSliderContent>
        )}
      </JuiModal>
    );
  }
}

const PhotoEditView = withTranslation('translations')(PhotoEditComponent);

export { PhotoEditView };
