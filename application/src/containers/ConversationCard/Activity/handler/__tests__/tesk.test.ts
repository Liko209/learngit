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
        verb: 'item.activity.created',
        noun: 'item.activity.task',
      },
      key: 'item.activity.verb-article-noun',
    });
  });
  it('Should return a object that key is equal to the verb-noun', () => {
    const activityData = { key: 'assigned_to_ids', old_value: [] };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.assigned',
        noun: 'item.activity.task',
      },
      key: 'item.activity.verb-noun',
    });
  });

  it('Should return a object that key is equal to the verb-noun', () => {
    const activityData = { key: 'assigned_to_ids', old_value: [1] };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.reassigned',
        noun: 'item.activity.task',
      },
      key: 'item.activity.verb-noun',
    });
  });

  it('Should return a object that key is equal to the verb-noun', () => {
    const activityData = { key: 'complete_boolean', value: true };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.completed',
        noun: 'item.activity.task',
      },
      key: 'item.activity.verb-noun',
    });
  });

  it('Should return a object that key is equal to the verb-noun-adjectives', () => {
    const activityData = { key: 'complete_boolean', value: false };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.marked',
        noun: 'item.activity.task',
        adjectives: 'item.activity.incomplete',
      },
      key: 'item.activity.verb-noun-adjectives',
    });
  });
});
