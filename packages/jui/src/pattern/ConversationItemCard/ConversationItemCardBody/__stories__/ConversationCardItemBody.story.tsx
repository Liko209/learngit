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
  JuiTaskSection,
  JuiTaskNotes,
  JuiTaskAvatarName,
  JuiAvatarName,
  JuiTimeMessage,
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
  .addDecorator(withInfoDecorator(JuiTaskNotes, { inline: true }))
  .add('TaskNotes', () => {
    return <JuiTaskNotes notes="notes" />;
  });

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module)
  .addDecorator(withInfoDecorator(JuiTaskNotes, { inline: true }))
  .add('TaskSection', () => {
    return <JuiTaskSection section="section" />;
  });

const Avatar = <JuiAvatar src={avatar} size="small" />;

const AvatarName1 = <JuiAvatarName avatar={Avatar} name="zigoErbi1" key="1" />;

const AvatarName2 = <JuiAvatarName avatar={Avatar} name="zigoErbi2" key="2" />;

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module)
  .addDecorator(withInfoDecorator(JuiTaskAvatarName, { inline: true }))
  .add('TaskAvatarName', () => {
    return (
      <JuiTaskAvatarName
        avatarNames={[AvatarName1, AvatarName2]}
        count={13}
        tOther="and other 11 people"
      />
    );
  });

storiesOf('Pattern/ConversationItemCard/ConversationItemCardBody', module)
  .addDecorator(withInfoDecorator(JuiTimeMessage, { inline: true }))
  .add('TimeMessage', () => {
    return <JuiTimeMessage time="today at 3:00 PM - 3:30 PM" />;
  });
