/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:35:35
 * Copyright © RingCentral. All rights reserved.
 */
import { TaskItem } from './';

function setTaskData(this: TaskItem, data: any) {
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

export { setTaskData };
