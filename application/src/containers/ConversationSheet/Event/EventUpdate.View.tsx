/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { JuiConversationItemCard as EventUpdateViewCard } from 'jui/pattern/ConversationItemCard';
import {
  JuiEventLocation,
  JuiEventDescription,
  JuiTimeMessage,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import {
  JuiEventCollapse,
  JuiEventCollapseContent,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardFooter';
// import { JuiEventCollapse } from 'jui/pattern/ConversationItemCard/ConversationItemCardFooter';
import { getDurtionTime, getDurtionTimeText } from '../../../utils/helper';
import { EventUpdateViewProps } from './types';

class EventUpdateView extends React.Component<EventUpdateViewProps, {}> {
  render() {
    const { event, post } = this.props;
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
    const { old_values } = post.activityData;
    const time = getDurtionTime(start, end);
    const oldTime = getDurtionTime(
      !old_values.start ? start : old_values.start,
      !old_values.end ? end : old_values.end,
    );
    const oldLocation = old_values.location;
    const timeText = getDurtionTimeText(
      repeat,
      repeatEndingAfter,
      repeatEndingOn,
      repeatEnding,
    );
    return (
      <EventUpdateViewCard
        title={text}
        titleColor={color}
        icon="event"
        footer={
          <JuiEventCollapse
            showText={t('showEventHistory')}
            hideText={t('hideEventHistory')}
          >
            <JuiEventCollapseContent>{oldLocation}</JuiEventCollapseContent>
            <JuiEventCollapseContent>{oldTime}</JuiEventCollapseContent>
          </JuiEventCollapse>
        }
      >
        <JuiTimeMessage time={`${time} ${timeText}`} />
        <JuiEventLocation location={location} />
        <JuiEventDescription description={description} />
      </EventUpdateViewCard>
    );
  }
}

export { EventUpdateView };
