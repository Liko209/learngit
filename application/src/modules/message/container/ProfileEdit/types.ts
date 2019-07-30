/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';

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

type EditProfileViewModelProps = {
  person: PersonModel;
  isLoading: boolean;
  homePageError: boolean;
  updateInfo: (key: EditItemSourceType['key'], value: string) => void;
  handleProfileEdit: () => void;
  getUpdateInfo: () => Object | undefined;
};

export { EditItemSourceType, EditProfileProps, EditProfileViewModelProps };
