/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 11:28:04
 * Copyright © RingCentral. All rights reserved.
 */
import { EventItem } from './';

function setEventData(this: EventItem, data: any) {
  const { color, description, start, end, location, repeat, repeat_ending, repeat_ending_after, repeat_ending_on, text } = data;

  this.color = color;
  this.description = description;
  this.start = start;
  this.end = end;
  this.location = location;
  this.repeat = repeat;
  this.repeat_ending = repeat_ending;
  this.repeat_ending_after = repeat_ending_after;
  this.repeat_ending_on = repeat_ending_on;
  this.text = text;
}

export { setEventData };
