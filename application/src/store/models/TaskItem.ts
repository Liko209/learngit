/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 14:08:56
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskItem } from 'sdk/models';
import { observable } from 'mobx';
import ItemModel from './Item';

export default class TaskItemModal extends ItemModel {
  @observable color: string;
  @observable complete: boolean;
  @observable notes: string;
  @observable start: number;
  @observable end: number;
  @observable section: string;
  @observable repeat: string;
  @observable repeatEnding: string;
  @observable repeatEndingAfter: string;
  @observable repeatEndingOn: string;
  @observable text: string;
  @observable due: number;
  @observable completeType: string;
  @observable assignedToIds: number[];
  @observable attachmentIds: number[];
  @observable completePeopleIds: number[];
  @observable completePercentage: number;

  constructor(data: TaskItem) {
    super(data);
    const {
      color,
      complete,
      notes,
      start,
      end,
      section,
      repeat,
      repeat_ending,
      repeat_ending_after,
      repeat_ending_on,
      text,
      due,
      complete_type,
      assigned_to_ids,
      attachment_ids,
      complete_people_ids,
      complete_percentage,
    } = data;
    this.color = color;
    this.complete = complete;
    this.notes = notes;
    this.start = start;
    this.end = end;
    this.section = section;
    this.repeat = repeat;
    this.repeatEnding = repeat_ending;
    this.repeatEndingAfter = repeat_ending_after;
    this.repeatEndingOn = repeat_ending_on;
    this.text = text;
    this.due = due;
    this.completeType = complete_type;
    this.assignedToIds = assigned_to_ids;
    this.attachmentIds = attachment_ids;
    this.completePeopleIds = complete_people_ids;
    this.completePercentage = complete_percentage;
  }

  static fromJS(data: TaskItem) {
    return new TaskItemModal(data);
  }
}
