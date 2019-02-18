/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 16:52:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';

import { JuiEventCollapse } from '..';

storiesOf('Pattern/ConversationItemCard/ConversationItemCardFooter', module)
  .addDecorator(withInfoDecorator(JuiEventCollapse, { inline: true }))
  .add('EventCollapse', () => {
    return <JuiEventCollapse hideText="hide text" showText="show text" />;
  });
