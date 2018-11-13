/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 10:39:46
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import backgrounds from '@storybook/addon-backgrounds';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardFooter,
} from '..';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiButtonBar } from '../../../components/Buttons/ButtonBar/ButtonBar';
import { JuiIconButton } from '../../../components/Buttons/IconButton/IconButton';
import JuiConversationCardFrom from '../ConversationCardFrom';

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiConversationCard, { inline: true }))
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
  )
  .add('ConversationCard', () => {
    const name = text('name', 'John Smith');
    const mode = boolean('navigation', false) ? 'navigation' : null;
    const from = mode && (
      <JuiConversationCardFrom name="Group" isGroup={true} />
    );
    return (
      <JuiConversationCard
        Avatar={<JuiAvatar size="medium">SH</JuiAvatar>}
        mode={mode}
      >
        <JuiConversationCardHeader name={name} time="3:15 PM" from={from}>
          <JuiButtonBar size="small">
            <JuiIconButton variant="plain" tooltipTitle="bookmark">
              bookmark
            </JuiIconButton>
            <JuiIconButton variant="plain" tooltipTitle="like">
              favorite
            </JuiIconButton>
            <JuiIconButton variant="plain" tooltipTitle="comment">
              add_comment
            </JuiIconButton>
            <JuiIconButton variant="plain" tooltipTitle="settings">
              settings
            </JuiIconButton>
          </JuiButtonBar>
        </JuiConversationCardHeader>
        <div>any content any content any content</div>
        <JuiConversationCardFooter>footer</JuiConversationCardFooter>
      </JuiConversationCard>
    );
  });
