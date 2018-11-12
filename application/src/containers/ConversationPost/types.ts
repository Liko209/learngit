/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:28:57
 * Copyright © RingCentral. All rights reserved.
 */

type ConversationPostProps = {
  id: number;
};

type PostType = 'post' | 'notification';

type ConversationPostViewProps = {
  id: number;
  type: PostType;
};

export { ConversationPostProps, ConversationPostViewProps, PostType };
