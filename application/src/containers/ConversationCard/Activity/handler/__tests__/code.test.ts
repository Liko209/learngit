/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:09
 * Copyright © RingCentral. All rights reserved.
 */

import code from '../code';

describe('Code', () => {
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const data = code();
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.shared',
        noun: 'item.activity.snippet',
      },
      key: 'item.activity.verb-article-noun',
    });
  });
});
