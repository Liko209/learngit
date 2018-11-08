/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import moment from 'moment';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { JuiEventLocation, JuiEventDescription, JuiTimeMessage } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { getDurtionTime } from '../../../utils/helper';
import { EventViewProps } from './types';

const REPEAT = {
  daily: ', repeating every day',
  weekdaily: ', repeating every weekday',
  weekly: ', repeating every week',
  monthly: ', repeating every month',
  yearly: ', repeating ervery year',
};

const TIMES = {
  daily: 'day',
  weekdaily: 'weekday',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
};

class EventView extends React.Component<EventViewProps, {}> {
  render() {
    const { event } = this.props;
    const { location, color, text, description, start, end, repeat, repeatEndingAfter, repeatEnding, repeatEndingOn } = event;
    const time = getDurtionTime(start, end);
    const after = repeatEndingAfter === '1' ? 'one' : repeatEndingAfter;
    const times = `${TIMES[repeat]}${Number(repeatEndingAfter) > 1 ? 's' : ''}`;
    const ENDING = {
      after: `for ${after} ${times}`,
      on: `until ${moment(repeatEndingOn).format('ddd, MMM D')}`,
    };

    return (
      <JuiConversationItemCard title={text} titleColor={color} icon="event">
        <JuiTimeMessage time={`${time} ${REPEAT[repeat] || ''} ${ENDING[repeatEnding] || ''}`} />
        <JuiEventLocation location={location} />
        <JuiEventDescription description={description} />
      </JuiConversationItemCard>
    );
  }
}

export { EventView };
