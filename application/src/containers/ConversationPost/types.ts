/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:28:57
 * Copyright © RingCentral. All rights reserved.
 */

enum POST_TYPE {
  NOTIFICATION = 1,
  POST,
}

type ConversationPostProps = {
  id: number;
  highlight: boolean;
};

type ConversationPostViewProps = {
  id: number;
  type: POST_TYPE;
  highlight: boolean;
};

export { ConversationPostProps, ConversationPostViewProps, POST_TYPE };
