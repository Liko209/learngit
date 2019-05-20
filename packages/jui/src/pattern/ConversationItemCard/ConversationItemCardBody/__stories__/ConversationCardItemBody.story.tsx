/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 09:39:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  JuiEventLocation,
  JuiEventDescription,
  JuiTaskSectionOrDescription,
  JuiAvatarName,
  JuiTimeMessage,
  JuiTaskAvatarNames,
} from '..';

import { JuiAvatar } from '../../../../components/Avatar';

import avatar from './img/avatar.jpg';

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module).add(
  'EventLocation',
  () => {
    return <JuiEventLocation location="Location" />;
  },
);

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module).add(
  'EventDescription',
  () => {
    return <JuiEventDescription>description</JuiEventDescription>;
  },
);

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module).add(
  'JuiTaskSectionOrDescription',
  () => {
    return <JuiTaskSectionOrDescription>note</JuiTaskSectionOrDescription>;
  },
);

const Avatar = <JuiAvatar src={avatar} size="small" />;

const AvatarName1 = <JuiAvatarName Avatar={Avatar} name="zigoErbi1" key="1" />;

const AvatarName2 = <JuiAvatarName Avatar={Avatar} name="zigoErbi2" key="2" />;

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module).add(
  'TaskAvatarName',
  () => {
    return (
      <JuiTaskAvatarNames count={13}>
        {AvatarName1}
        {AvatarName2}
      </JuiTaskAvatarNames>
    );
  },
);

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module).add(
  'TimeMessage',
  () => {
    return <JuiTimeMessage time="today at 3:00 PM - 3:30 PM" />;
  },
);
