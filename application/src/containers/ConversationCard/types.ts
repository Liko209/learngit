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
  onHighlightAnimationEnd?: React.AnimationEventHandler;
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
  itemIds: number[];
  showProgressActions: boolean;
  likes?: number[];
  mode?: string;
  onAnimationEnd?: React.AnimationEventHandler;
};

export { ConversationCardProps, ConversationCardViewProps };
