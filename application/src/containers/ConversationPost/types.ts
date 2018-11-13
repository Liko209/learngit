/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:28:57
 * Copyright © RingCentral. All rights reserved.
 */

enum PostType {
  notification = 'notification',
  post = 'post',
}

type ConversationPostProps = {
  id: number;
};

type ConversationPostViewProps = {
  id: number;
  type: PostType;
};

export { ConversationPostProps, ConversationPostViewProps, PostType };
