import { POST_TYPE } from './../../common/getPostType';
import { JuiConversationCard } from 'jui/src/pattern/ConversationCard';
import { RefObject } from 'react';

/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:28:57
 * Copyright © RingCentral. All rights reserved.
 */

type ConversationPostProps = {
  cardRef?: RefObject<JuiConversationCard>;
  id: number;
  mode?: 'navigation';
};

type ConversationPostViewProps = ConversationPostProps & {
  type: POST_TYPE;
};

export { ConversationPostProps, ConversationPostViewProps };
