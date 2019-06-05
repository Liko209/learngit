/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:12
 * Copyright © RingCentral. All rights reserved.
 */
import conference from '../conference';

describe('Conference', () => {
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const data = conference();
    expect(data).toEqual({
      parameter: {
        verb: 'started',
        noun: 'audio conference',
      },
      key: 'item.activity.started a audio conference',
    });
  });
});
