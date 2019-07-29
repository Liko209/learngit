/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:30
 * Copyright © RingCentral. All rights reserved.
 */
import task from '../task';

describe('Task', () => {
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const activityData = undefined;
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'created',
        noun: 'task',
      },
      key: 'item.activity.created a task',
    });
  });
  it('Should return a object that key is equal to the verb-noun', () => {
    const activityData = { key: 'assigned_to_ids', old_value: [] };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'assigned',
        noun: 'task',
      },
      key: 'item.activity.assigned task',
    });
  });

  it('Should return a object that key is equal to the verb-noun', () => {
    const activityData = { key: 'assigned_to_ids', old_value: [1] };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'reassigned',
        noun: 'task',
      },
      key: 'item.activity.reassigned task',
    });
  });

  it('Should return a object that key is equal to the verb-noun', () => {
    const activityData = { key: 'complete_boolean', value: true };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'completed',
        noun: 'task',
      },
      key: 'item.activity.completed task',
    });
  });

  it('Should return a object that key is equal to the verb-noun-adjective', () => {
    const activityData = { key: 'complete_boolean', value: false };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'marked',
        noun: 'task',
        adjective: 'incomplete',
      },
      key: 'item.activity.marked task incomplete',
    });
  });

  it('Should return a object that key is transformed by complete_percentage', () => {
    let activityData = { key: 'complete_percentage', value: 100 };
    let data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'completed',
        noun: 'task',
      },
      key: 'item.activity.completed task',
    });

    activityData = { key: 'complete_percentage', value: 100, old_value: 60 };
    data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'completed',
        noun: 'task',
      },
      key: 'item.activity.completed task',
    });

    activityData = { key: 'complete_percentage', value: 80 };
    data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        count: 80,
        verb: 'completed',
        noun: 'task',
      },
      key: 'item.activity.completed {{count}}% of task',
    });

    activityData = { key: 'complete_percentage', value: 80, old_value: 50 };
    data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        count: 30,
        verb: 'completed',
        noun: 'task',
      },
      key: 'item.activity.completed {{count}}% of task',
    });
  });
});
