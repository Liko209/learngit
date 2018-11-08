/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:35:35
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskItem } from './items.d';

function setTaskData(this: TaskItem, data: any) {
  const {
    color,
    complete,
    notes,
    start,
    section,
    repeat,
    repeat_ending,
    repeat_ending_after,
    text,
    due,
    complete_type,
    assigned_to_ids,
    attachment_ids,
  } = data;

  this.color = color;
  this.complete = complete;
  this.notes = notes;
  this.start = start;
  this.section = section;
  this.repeat = repeat;
  this.repeat_ending = repeat_ending;
  this.repeat_ending_after = repeat_ending_after;
  this.text = text;
  this.due = due;
  this.complete_type = complete_type;
  this.assigned_to_ids = assigned_to_ids;
  this.attachment_ids = attachment_ids;
}

export { setTaskData };
