/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:16
 * Copyright © RingCentral. All rights reserved.
 */
import event from '../event';

describe('Event', () => {
  it('Should return a object that key is equal to the verb-noun', () => {
    const activityData = {};
    const data = event({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'updated',
        noun: 'event',
      },
      key: 'item.activity.updated event',
    });
  });
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const activityData = undefined;
    const data = event({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'created',
        noun: 'event',
      },
      key: 'item.activity.created a event',
    });
  });
});
