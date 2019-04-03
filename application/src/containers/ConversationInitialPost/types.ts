/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-27 17:47:11
 * Copyright © RingCentral. All rights reserved.
 */
import { CONVERSATION_TYPES } from '@/constants';
import PersonModel from '@/store/models/Person';
import { WithTranslation } from 'react-i18next';

type ConversationInitialPostProps = {
  id: number; // group id
  notEmpty: boolean;
};

type ConversationInitialPostViewProps = WithTranslation & {
  displayName: string;
  groupType: CONVERSATION_TYPES;
  groupDescription: string;
  creator: PersonModel;
  isTeam: boolean;
  createTime: number;
  isCompanyTeam: boolean;
} & ConversationInitialPostProps;

export { ConversationInitialPostProps, ConversationInitialPostViewProps };
