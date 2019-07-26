/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-25 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { EditItemSourceType } from './types';

const editItemSource: EditItemSourceType[][] = [
  [
    {
      key: 'firstName',
      automationId: 'editProfileFirstNameItem',
      maxLength: 50,
    },
    {
      key: 'lastName',
      automationId: 'editProfileLastNameItem',
      maxLength: 50,
    },
  ],
  [
    {
      key: 'title',
      automationId: 'editProfileTitleItem',
      maxLength: 200,
    },
    {
      key: 'location',
      automationId: 'editProfileLocationItem',
      maxLength: 200,
    },
  ],
  [
    {
      key: 'webpage',
      automationId: 'editProfileWebpageItem',
      error: 'webpageError',
      maxLength: 200,
      isLastItem: true,
    },
  ],
];

export { editItemSource };
