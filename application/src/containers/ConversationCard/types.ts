/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-08 16:26:47
 * Copyright © RingCentral. All rights reserved.
 */
import PostModel from '@/store/models/Post';
import PersonModel from '@/store/models/Person';
type ConversationCardProps = {
  id: number; // post id
  mode?: 'navigation';
  highlight?: boolean;
  onHighlightAnimationStart?: React.AnimationEventHandler;
};

type ConversationCardViewProps = {
  id: number;
  highlight: boolean;
  post: PostModel;
  hideText: boolean;
  creator: PersonModel;
  groupId: number;
  name: string;
  customStatus?: string;
  createTime: string;
  itemTypeIds?: {
    [key: number]: number[];
  };
  showProgressActions: boolean;
  likes?: number[];
  mode?: string;
  onAnimationStart?: React.AnimationEventHandler;
  onHighlightAnimationStart?: React.AnimationEventHandler;
  isEditMode: boolean;
  showActivityStatus: boolean;
};

export { ConversationCardProps, ConversationCardViewProps };
