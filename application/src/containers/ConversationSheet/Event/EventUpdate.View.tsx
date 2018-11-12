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
import { getDurationTime, getDurationTimeText } from '../../../utils/helper';
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
    const time = getDurationTime(start, end);
    const oldTime = getDurationTime(
      !old_values.start ? start : old_values.start,
      !old_values.end ? end : old_values.end,
    );
    const oldLocation = old_values.location;
    const timeText = getDurationTimeText(
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
            {oldLocation && (
              <JuiEventCollapseContent>{oldLocation}</JuiEventCollapseContent>
            )}
            {oldTime && (
              <JuiEventCollapseContent>{oldTime}</JuiEventCollapseContent>
            )}
          </JuiEventCollapse>
        }
      >
        <JuiTimeMessage time={`${time} ${timeText}`} />
        {location && <JuiEventLocation location={location} />}
        {description && <JuiEventDescription description={description} />}
      </EventUpdateViewCard>
    );
  }
}

export { EventUpdateView };
