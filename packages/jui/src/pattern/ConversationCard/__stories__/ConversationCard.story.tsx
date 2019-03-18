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
import { JuiConversationPostLike } from '../../ConversationPostLike';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardFooter,
} from '..';
import { JuiAvatar } from '../../../components/Avatar';
import JuiConversationCardFrom from '../ConversationCardFrom';
import JuiConversationCardBody from '../ConversationCardBody';

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiConversationCard, { inline: true }))
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
  )
  .add('ConversationCard', () => {
    const name = text('name', 'John Smith');
    const groupName = text('Group name', 'Team AAA');
    const activity = text('activity', 'shared 22 files');
    const status = text('status', '🏃 in the meeting');
    const mode = boolean('navigation', false) ? 'navigation' : undefined;
    const from = mode && (
      <JuiConversationCardFrom
        name={groupName}
        isTeam={true}
        onClick={() => {}}
      />
    );
    const card = (
      <JuiConversationCard
        Avatar={
          <JuiAvatar color="lake" size="medium">
            SH
          </JuiAvatar>
        }
        mode={mode}
        key={1}
      >
        <JuiConversationCardHeader
          name={name}
          status={status}
          time="3:15 PM"
          from={from}
          notification={<span>{activity}</span>}
        />
        <JuiConversationCardBody>any content</JuiConversationCardBody>
        <JuiConversationCardFooter>
          <JuiConversationPostLike
            title="like"
            iLiked={true}
            likedUsersCount={10}
            onClick={() => {}}
          />
        </JuiConversationCardFooter>
      </JuiConversationCard>
    );
    return (
      <>
        {card}
        {card}
      </>
    );
  });
