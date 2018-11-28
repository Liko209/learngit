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
        translated: {
          verb: 'shared',
          noun: 'note',
        },
      },
      key: 'verb-article-noun',
    });
  });
});
