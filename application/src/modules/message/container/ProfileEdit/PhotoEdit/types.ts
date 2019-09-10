/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';
import { Transform } from 'jui/components/ZoomArea';
import { HeadShotInfo } from 'sdk/module/person/types';
import { LocalInfo } from '../types';

type PhotoEditProps = {
  person: PersonModel;
  file: File;
  onPhotoEdited: (headShotInfo: HeadShotInfo, localInfo: LocalInfo) => void;
};

type EditItemSourceType = {
  key:
    | 'firstName'
    | 'lastName'
    | 'title'
    | 'location'
    | 'department'
    | 'webpage'
    | 'phone';
  automationId: string;
  maxLength: number;
  error?: string;
  isLastItem?: boolean;
};

type PhotoEditViewModelProps = {
  person: PersonModel;
  isLoading: boolean;
  webpageError: boolean;
  transform: Transform;
  currentImageUrl: string;
  shouldShowShortName: boolean;
  sliderValue: number;
  isGifImage: boolean;
  currentFile: File;
  handleSliderChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: number,
  ) => void;
  updateTransform: (transform: Transform) => void;
  updateImageUrl: (file: File) => void;
  handleOk: (imageRef: React.RefObject<HTMLImageElement> | null) => () => void;
  getInitSize: (contentWidth: number, contentHeight: number) => void;
};

export { EditItemSourceType, PhotoEditProps, PhotoEditViewModelProps };
