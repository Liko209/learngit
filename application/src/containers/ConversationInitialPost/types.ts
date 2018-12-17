/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-27 17:47:11
 * Copyright © RingCentral. All rights reserved.
 */
import { CONVERSATION_TYPES } from '@/constants';
import PersonModel from '@/store/models/Person';
import { TranslationFunction } from 'i18next';
import { WithNamespaces } from 'react-i18next';

type ConversationInitialPostProps = {
  id: number; // group id
  notEmpty: boolean;
};

type ConversationInitialPostViewProps = WithNamespaces & {
  id: number; // group id
  displayName: string;
  groupType: CONVERSATION_TYPES;
  groupDescription: string;
  creator: PersonModel;
  creatorGroupId: number;
  t: TranslationFunction;
  isTeam: boolean;
  notEmpty: boolean;
};

export { ConversationInitialPostProps, ConversationInitialPostViewProps };
