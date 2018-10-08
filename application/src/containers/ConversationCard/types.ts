/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-10-08 16:26:47
* Copyright © RingCentral. All rights reserved.
*/
import PostModel from '@/store/models/Post';
import PersonModel from '@/store/models/Person';
type ConversationCardProps = {
  id: number;
};

type ConversationCardViewProps = {
  id: number;
  post: PostModel;
  creator: PersonModel;
  resend: Function;
  delete: Function;
  displayTitle: string;
  createTime: string;
};

export { ConversationCardProps, ConversationCardViewProps };
