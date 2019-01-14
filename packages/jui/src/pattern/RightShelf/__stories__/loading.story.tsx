/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-04 14:47:42
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { JuiConversationRightRailLoading } from '../Loading';

storiesOf('Pattern/ConversationRightShelf', module).add(
  'JuiConversationRightRailLoading',
  () => {
    return <JuiConversationRightRailLoading />;
  },
);
