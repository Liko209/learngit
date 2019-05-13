/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-09 09:53:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { JuiConversationPageMember } from '../ConversationPageMember';

storiesOf('Pattern/ConversationPageMember', module).add(
  'JuiConversationPageMember',
  () => {
    const title = text('title', 'Members');

    return (
      <JuiConversationPageMember
        onClick={() => {}}
        ariaLabel={title}
        title={title}
      >
        <span>500</span>
      </JuiConversationPageMember>
    );
  },
);
