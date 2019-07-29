/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:53:17
 * Copyright © RingCentral. All rights reserved.
 */
import TaskItemModel from '../TaskItem';

describe('TaskItemModel', () => {
  it('new TaskItemModel', () => {
    const taskItemModel = TaskItemModel.fromJS({
      color: 'color',
      complete: 'complete',
      notes: 'notes',
      start: 1,
      end: 0,
      section: 'section',
      repeat: 'repeat',
      repeat_ending: 'repeat_ending',
      repeat_ending_after: 'repeat_ending_after',
      repeat_ending_on: 'repeat_ending_on',
      text: 'text',
      due: 2,
      complete_type: 'complete_type',
      assigned_to_ids: [1, 2],
      attachment_ids: [1, 2],
      complete_people_ids: [1, 2],
      complete_percentage: 50,
    } as any);
    expect(taskItemModel.color).toBe('color');
    expect(taskItemModel.complete).toBe('complete');
    expect(taskItemModel.notes).toBe('notes');
    expect(taskItemModel.start).toBe(1);
    expect(taskItemModel.end).toBe(0);
    expect(taskItemModel.section).toBe('section');
    expect(taskItemModel.repeat).toBe('repeat');
    expect(taskItemModel.repeatEnding).toBe('repeat_ending');
    expect(taskItemModel.repeatEndingAfter).toBe('repeat_ending_after');
    expect(taskItemModel.repeatEndingOn).toBe('repeat_ending_on');
    expect(taskItemModel.text).toBe('text');
    expect(taskItemModel.due).toBe(2);
    expect(taskItemModel.completeType).toBe('complete_type');
    expect(taskItemModel.assignedToIds).toEqual([1, 2]);
    expect(taskItemModel.attachmentIds).toEqual([1, 2]);
    expect(taskItemModel.completePeopleIds).toEqual([1, 2]);
    expect(taskItemModel.completePercentage).toBe(50);
  });
});
