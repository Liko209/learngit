/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-24 21:31:35
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { LinkItem } from './Link';
import DateTimeUtil from '@/utils/dateTime';
import colorMap from '@/utils/colors';

const EventItem = LinkItem.extend`
  display: flex;
  justify-content: space-between;
  .text {
    color: ${props => (props.color ? colorMap[props.color] : '#333')};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .time {
    white-space: nowrap;
    color: #aaa;
    padding-left: 5px;
  }
`;

function startTimeRelativePretty(event) {
  const { start, end, all_day } = event;
  if (end) {
    const duration = end - start;
    const duringDays = Math.floor(duration / 1000 / 3600 / 24);
    return duringDays <= 0
      ? all_day
        ? 'all day'
        : DateTimeUtil.prettyTime(start)
      : `thru ${DateTimeUtil.prettyDate(end)}`;
  }
  return all_day ? 'all day' : DateTimeUtil.prettyTime(start);
}

const Event = props => {
  const { text, color } = props;
  return (
    <EventItem color={color}>
      <div className="text">[Event] {text}</div>
      <div className="time">{startTimeRelativePretty(props)}</div>
    </EventItem>
  );
};

export default Event;
