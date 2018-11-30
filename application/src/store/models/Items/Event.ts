/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 11:28:04
 * Copyright © RingCentral. All rights reserved.
 */
import { EventItem } from './';

function setEventData(this: EventItem, data: any) {
  const {
    color,
    description,
    start,
    end,
    location,
    repeat,
    repeat_ending,
    repeat_ending_after,
    repeat_ending_on,
    text,
  } = data;
  this.color = color;
  this.description = description;
  this.start = start;
  this.end = end;
  this.location = location;
  this.repeat = repeat;
  this.repeatEnding = repeat_ending;
  this.repeatEndingAfter = repeat_ending_after;
  this.repeatEndingOn = repeat_ending_on;
  this.text = text;
}

export { setEventData };
