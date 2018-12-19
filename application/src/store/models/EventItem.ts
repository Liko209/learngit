/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 14:08:56
 * Copyright © RingCentral. All rights reserved.
 */
import { EventItem } from 'sdk/models';
import { observable } from 'mobx';
import ItemModel from './Item';

export default class EventItemModal extends ItemModel {
  @observable color: string;
  @observable description: string;
  @observable start: number;
  @observable end: number;
  @observable location: string;
  @observable repeat: string;
  @observable repeatEnding: string;
  @observable repeatEndingAfter: string;
  @observable repeatEndingOn: string;
  @observable text: string;

  constructor(data: EventItem) {
    super(data);
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

  static fromJS(data: EventItem) {
    return new EventItemModal(data);
  }
}
