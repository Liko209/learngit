/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';

type PhotoEditProps = {
  id: number; // personId || conversationId
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
  currentScale: number;
  updateScale: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: number,
  ) => void;
};

export { EditItemSourceType, PhotoEditProps, PhotoEditViewModelProps };
