import { CONVERSATION_TYPES } from '@/constants';
import PersonModel from '@/store/models/Person';

/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-27 17:47:11
 * Copyright © RingCentral. All rights reserved.
 */
type ConversationInitialPostProps = {
  id: number; // group id
};

type ConversationInitialPostViewProps = {
  id: number; // group id
  displayName: string;
  groupType: CONVERSATION_TYPES;
  groupDescription: string;
  creator: PersonModel;
  creatorGroupId: number;
};

export { ConversationInitialPostProps, ConversationInitialPostViewProps };
