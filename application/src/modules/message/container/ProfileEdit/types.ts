/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';
import { HeadShotInfo } from 'sdk/module/person/types';

type EditProfileProps = {
  id: number; // personId || conversationId
};

type EditItemSourceType = {
  key: 'firstName' | 'lastName' | 'jobTitle' | 'location' | 'homepage';
  automationId: string;
  maxLength: number;
  error?: string;
  isLastItem?: boolean;
};

type LocalInfo = {
  url: string;
  width: number;
  height: number;
  left: number;
  top: number;
};

type EditProfileViewModelProps = {
  person: PersonModel;
  currentPersonInfo: PersonModel;
  isLoading: boolean;
  localInfo: LocalInfo;
  homepageError: boolean;
  updateInfo: (key: EditItemSourceType['key'], value: string) => void;
  handleProfileEdit: () => void;
  getUpdateInfo: () => Object | undefined;
  onPhotoEdited: (headShotInfo: HeadShotInfo, localInfo: LocalInfo) => void;
};

export {
  EditItemSourceType,
  EditProfileProps,
  EditProfileViewModelProps,
  LocalInfo,
};
