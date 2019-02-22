/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:26
 * Copyright © RingCentral. All rights reserved.
 */
import page from '../page';

describe('Page', () => {
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const data = page();
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.shared',
        noun: 'item.activity.note',
      },
      key: 'item.activity.verb-article-noun',
    });
  });
});
