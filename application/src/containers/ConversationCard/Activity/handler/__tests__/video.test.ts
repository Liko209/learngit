/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:34
 * Copyright © RingCentral. All rights reserved.
 */
import video from '../video';

describe('Video', () => {
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const data = video();
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.started',
        noun: 'item.activity.video chat',
      },
      key: 'item.activity.verb-article-noun',
    });
  });
});
