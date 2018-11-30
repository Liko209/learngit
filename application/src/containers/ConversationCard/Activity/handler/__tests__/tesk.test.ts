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
      key: 'verb-article-noun',
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
      key: 'verb-noun',
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
      key: 'verb-noun',
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
      key: 'verb-noun',
    });
  });

  it('Should return a object that key is equal to the verb-noun-adjectives', () => {
    const activityData = { key: 'complete_boolean', value: false };
    const data = task({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'marked',
        noun: 'task',
        adjectives: 'incomplete',
      },
      key: 'verb-noun-adjectives',
    });
  });
});
