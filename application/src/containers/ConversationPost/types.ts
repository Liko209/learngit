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
  highlight?: boolean;
  onHighlightAnimationStart?: React.AnimationEventHandler;
};

type ConversationPostViewProps = {
  id: number;
  type: POST_TYPE;
  highlight: boolean;
  onHighlightAnimationStart?: React.AnimationEventHandler;
};

export { ConversationPostProps, ConversationPostViewProps, POST_TYPE };
