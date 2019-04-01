import { JuiConversationCard } from 'jui/src/pattern/ConversationCard';
import { RefObject } from 'react';

/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:28:57
 * Copyright © RingCentral. All rights reserved.
 */

enum POST_TYPE {
  NOTIFICATION = 1,
  POST,
}

type props = {
  cardRef?: RefObject<JuiConversationCard>;
  id: number;
  mode?: 'navigation';
};

type ConversationPostProps = props;

type ConversationPostViewProps = props & {
  type: POST_TYPE;
};

export { ConversationPostProps, ConversationPostViewProps, POST_TYPE };
