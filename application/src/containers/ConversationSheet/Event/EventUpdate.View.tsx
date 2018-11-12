/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiConversationItemCard as EventUpdateViewCard } from 'jui/pattern/ConversationItemCard';
import { JuiEventLocation, JuiEventDescription, JuiTimeMessage } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
// import { JuiEventCollapse } from 'jui/pattern/ConversationItemCard/ConversationItemCardFooter';
import { getDurtionTime, getDurtionTimeText } from '../../../utils/helper';
import { EventUpdateViewProps } from './types';

class EventUpdateView extends React.Component<EventUpdateViewProps, {}> {
  render() {
    const { event, post } = this.props;
    const { location, color, text, description, start, end, repeat, repeatEndingAfter, repeatEnding, repeatEndingOn } = event;
    const time = getDurtionTime(start, end);
    const timeText = getDurtionTimeText(repeat, repeatEndingAfter, repeatEndingOn, repeatEnding);
    console.log(post, '-----event update post');
    return (
      <EventUpdateViewCard title={text} titleColor={color} icon="event">
        <JuiTimeMessage time={`${time} ${timeText}`} />
        <JuiEventLocation location={location} />
        <JuiEventDescription description={description} />
      </EventUpdateViewCard>
    );
  }
}

export { EventUpdateView };
