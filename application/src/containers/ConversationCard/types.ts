/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-10-08 16:26:47
* Copyright © RingCentral. All rights reserved.
*/
import PostModel from '@/store/models/Post';
import PersonModel from '@/store/models/Person';
type ConversationCardProps = {
  id: number; // post id
};

type ConversationCardViewProps = {
  id: number;
  post: PostModel;
  creator: PersonModel;
  displayTitle: string;
  createTime: string;
  kv: {
    number?: string;
  };
  currentUserId: number;
};

export { ConversationCardProps, ConversationCardViewProps };
