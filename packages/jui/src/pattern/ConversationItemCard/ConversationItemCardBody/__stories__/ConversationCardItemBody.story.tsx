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
} from '..';

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
