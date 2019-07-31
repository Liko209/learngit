/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action, computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Transform } from 'jui/components/ZoomArea';
import { debounce } from 'lodash';
import portalManager from '@/common/PortalManager';
import { PhotoEditProps } from './types';

const CONTENT_SIZE = 280;
class PhotoEditViewModel extends AbstractViewModel<PhotoEditProps> {
  @observable currentImageUrl: string = this.headShotUrl;
  @observable uploadImageType: string;
  @observable sliderValue: number;
  @observable currentFile: File;
  @observable initSize: { width: number; height: number };
  @observable transform: Transform = { scale: 1, translateX: 0, translateY: 0 };

  @action
  handleSliderChange = debounce(
    async (event: React.ChangeEvent<HTMLInputElement>, value: number) => {
      this.updateScale(value);
      this.sliderValue = value;
    },
    10,
    { maxWait: 1000 / 60 }, // Ensure 60FPS
  );

  @action
  updateScale = (value: number) => {
    this.transform.scale = value;
  };

  @action
  updateTransform = (transform: Transform) => {
    transform.scale = Number(transform.scale.toFixed(1));
    this.transform = transform;
  };

  @computed
  get isGifImage() {
    return this.uploadImageType === 'image/gif';
  }

  @action
  updateImageUrl = (file: File) => {
    this.currentFile = file;
    this.uploadImageType = file.type;
    this.currentImageUrl = window.URL.createObjectURL(file);
  };

  @computed
  get shortName() {
    const { person } = this.props;
    return (person && person.shortName) || '';
  }

  @computed
  get headShotUrl(): string {
    const { person } = this.props;
    const { headshot = '' } = person;
    if (!headshot) return '';
    return typeof headshot === 'string' ? headshot : headshot.url;
  }

  @computed
  get shouldShowShortName() {
    const { person } = this.props;
    if (person) {
      return !person.hasHeadShot && !!person.shortName && !this.currentImageUrl;
    }
    return false;
  }

  @action
  getInitSize = (contentWidth: number, contentHeight: number) => {
    this.initSize = {
      width: contentWidth,
      height: contentHeight,
    };
  };

  @action
  imageToFile = async (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(img, 0, 0);
    await new Promise(resolve => {
      canvas.toBlob((blob: Blob) => {
        resolve(blob);
      }, 'image/*');
    }).then((blob: Blob) => {
      if (!blob) return;
      this.currentFile = new File([blob], 'headshot', {
        type: this.uploadImageType,
      });
    });
  };

  numberToSting = (before: number, after: number) => {
    return `${Math.round(before)}x${Math.round(after)}`;
  };

  handleOk = (
    imageRef: React.RefObject<HTMLImageElement> | null,
  ) => async () => {
    if (!imageRef || !imageRef.current) return;
    if (!this.currentFile) return;
    const { photoEditCb } = this.props;
    const { scale, translateX, translateY } = this.transform;
    const { width, height } = this.initSize;
    const baseSize = width > height ? height : width;
    const initScale = CONTENT_SIZE / baseSize;
    const realScale = initScale * scale;
    const crop = baseSize / scale;
    photoEditCb({
      file: this.currentFile,
      offset: this.numberToSting(
        width / 2 - translateX / initScale - CONTENT_SIZE / 2 / realScale,
        height / 2 - translateY / initScale - CONTENT_SIZE / 2 / realScale,
      ),
      crop: this.numberToSting(crop, crop),
    });
    portalManager.dismissLast();
  };
}

export { PhotoEditViewModel };
