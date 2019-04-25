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
        verb: 'item.activity.updated',
        noun: 'item.activity.event',
      },
      key: 'item.activity.verb-noun',
    });
  });
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const activityData = undefined;
    const data = event({ activityData });
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.created',
        noun: 'item.activity.event',
      },
      key: 'item.activity.verb-article-noun',
    });
  });
});
