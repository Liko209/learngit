/*
 * @Author: Spike.Yang
 * @Date: 2019-07-23 09:26:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import {
  JuiListButtonItem,
  JuiListButtonItemProps
} from '../../components/Lists/ListButtonItem';

type JuiConversationListTopProps = JuiListButtonItemProps;

const JuiConversationListTop = memo((props: JuiConversationListTopProps) => (
  <JuiListButtonItem {...props} />
));

export { JuiConversationListTop, JuiConversationListTopProps };
