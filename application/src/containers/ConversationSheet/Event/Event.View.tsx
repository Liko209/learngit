/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import {
  JuiEventLocation,
  JuiEventDescription,
  JuiTimeMessage,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { getDurtionTime, getDurtionTimeText } from './helper';
import { EventViewProps } from './types';

class EventView extends React.Component<EventViewProps, {}> {
  render() {
    const { event } = this.props;
    const {
      location,
      color,
      text,
      description,
      start,
      end,
      repeat,
      repeatEndingAfter,
      repeatEnding,
      repeatEndingOn,
    } = event;
    const time = getDurtionTime(start, end);
    const timeText = getDurtionTimeText(
      repeat,
      repeatEndingAfter,
      repeatEndingOn,
      repeatEnding,
    );
    return (
      <JuiConversationItemCard title={text} titleColor={color} icon="event">
        <JuiTimeMessage time={`${time} ${timeText}`} />
        <JuiEventLocation location={location} />
        <JuiEventDescription description={description} />
      </JuiConversationItemCard>
    );
  }
}

export { EventView };
