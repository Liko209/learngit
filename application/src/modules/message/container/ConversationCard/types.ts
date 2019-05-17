/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-08 16:26:47
 * Copyright © RingCentral. All rights reserved.
 */
// import { PromisedComputedValue } from 'computed-async-mobx';
import PostModel from '@/store/models/Post';
import PersonModel from '@/store/models/Person';
import { RefObject } from 'react';
import { JuiConversationCard } from 'jui/pattern/ConversationCard';

type ConversationCardProps = {
  id: number; // post id
  mode?: 'navigation';
  onHighlightAnimationStart?: React.AnimationEventHandler;
  cardRef?: RefObject<JuiConversationCard>;
};

type ConversationCardViewProps = {
  id: number;
  post: PostModel;
  hideText: boolean;
  creator: PersonModel;
  groupId: number;
  name: string;
  isArchivedGroup: boolean;
  showToast: boolean;
  customStatus?: string;
  createTime: string; // PromisedComputedValue<string>;
  itemTypeIds?: {
    [key: number]: number[];
  };
  cardRef?: RefObject<JuiConversationCard>;
  showProgressActions: boolean;
  likes?: number[];
  mode?: string;
  onAnimationStart?: React.AnimationEventHandler;
  onHighlightAnimationStart?: React.AnimationEventHandler;
  isEditMode: boolean;
  showActivityStatus: boolean;
  beforeJump: Function;
  terms?: string[];
};

export { ConversationCardProps, ConversationCardViewProps };
