/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 10:39:46
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs/react';
import backgrounds from '@storybook/addon-backgrounds';
import { withInfoDecorator } from '../../../utils/decorators';

import { JuiConversationCard, JuiConversationCardHeader, JuiConversationCardFooter } from '..';
import { JuiAvatar } from '../../../atoms/Avatar';
import JuiButtonBar from '../../../molecules/ButtonBar/ButtonBar';
import JuiIconButton from '../../../molecules/IconButton/IconButton';

storiesOf('Organisms/ConversationCard 🔜', module)
  .addDecorator(withInfoDecorator(JuiConversationCard, { inline: true }))
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
  )
  .addWithJSX('Metadata', () => {
    const name = text('name', 'John Smith');
    return (
      <JuiConversationCard Avatar={<JuiAvatar size="medium">SH</JuiAvatar>}>
        <JuiConversationCardHeader name={name} time="3:15 PM">
          <JuiButtonBar size="small">
            <JuiIconButton variant="plain" tooltipTitle="bookmark">bookmark</JuiIconButton>
            <JuiIconButton variant="plain" tooltipTitle="like">favorite</JuiIconButton>
            <JuiIconButton variant="plain" tooltipTitle="comment">add_comment</JuiIconButton>
            <JuiIconButton variant="plain" tooltipTitle="settings">settings</JuiIconButton>
          </JuiButtonBar>
        </JuiConversationCardHeader>
        <div>
          any content
          any content
          any content
        </div>
        <JuiConversationCardFooter>
          footer
        </JuiConversationCardFooter>
      </JuiConversationCard>
    );
  });
