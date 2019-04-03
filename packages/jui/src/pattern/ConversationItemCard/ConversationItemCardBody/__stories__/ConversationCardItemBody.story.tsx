/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 09:39:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
// import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';

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

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module)
  .addDecorator(withInfoDecorator(JuiEventLocation, { inline: true }))
  .add('EventLocation', () => {
    return <JuiEventLocation location="Location" />;
  });

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module)
  .addDecorator(withInfoDecorator(JuiEventDescription, { inline: true }))
  .add('EventDescription', () => {
    return <JuiEventDescription description="description" />;
  });

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module)
  .addDecorator(
    withInfoDecorator(JuiTaskSectionOrDescription, { inline: true }),
  )
  .add('JuiTaskSectionOrDescription', () => {
    return <JuiTaskSectionOrDescription text="notes" />;
  });

const Avatar = <JuiAvatar src={avatar} size="small" />;

const AvatarName1 = <JuiAvatarName Avatar={Avatar} name="zigoErbi1" key="1" />;

const AvatarName2 = <JuiAvatarName Avatar={Avatar} name="zigoErbi2" key="2" />;

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module)
  .addDecorator(withInfoDecorator(JuiTaskAvatarNames, { inline: true }))
  .add('TaskAvatarName', () => {
    return (
      <JuiTaskAvatarNames count={13}>
        {AvatarName1}
        {AvatarName2}
      </JuiTaskAvatarNames>
    );
  });

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module)
  .addDecorator(withInfoDecorator(JuiTimeMessage, { inline: true }))
  .add('TimeMessage', () => {
    return <JuiTimeMessage time="today at 3:00 PM - 3:30 PM" />;
  });
