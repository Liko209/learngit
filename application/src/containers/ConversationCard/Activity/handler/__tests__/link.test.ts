/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:23
 * Copyright © RingCentral. All rights reserved.
 */
import link from '../link';

describe('Link', () => {
  it('Should return a object that key is equal to the verb-numerals-noun', () => {
    const ids = [1, 2, 3];
    const data = link({ ids });
    expect(data).toEqual({
      parameter: {
        count: 3,
        verb: 'item.activity.shared',
        noun: 'item.activity.link',
      },
      key: 'item.activity.verb-numerals-noun',
    });
  });
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const ids = [1];
    const data = link({ ids });
    expect(data).toEqual({
      parameter: {
        verb: 'item.activity.shared',
        noun: 'item.activity.link',
      },
      key: 'item.activity.verb-article-noun',
    });
  });
});
