/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import file from '../file';

describe('File', () => {
  it('Should return a object that key is equal to the verb-noun-numerals', () => {
    const ids = [1];
    const itemData = {
      version_map: {
        1: 2,
      },
    };
    const data = file({ ids, itemData });
    expect(data).toEqual({
      parameter: {
        count: 2,
        verb: 'uploaded',
        noun: 'version',
      },
      key: 'verb-noun-numerals',
    });
  });
  it('Should return a object that key is equal to the verb-article-noun', () => {
    const ids = [1];
    const itemData = {
      version_map: {
        1: 1,
      },
    };
    const data = file({ ids, itemData });
    expect(data).toEqual({
      parameter: {
        verb: 'shared',
        noun: 'file',
      },
      key: 'verb-article-noun',
    });
  });
  it('Should return a object that key is equal to the verb-numerals-noun', () => {
    const ids = [1, 2];
    const itemData = {
      version_map: {
        1: 1,
        2: 1,
      },
    };
    const data = file({ ids, itemData });
    expect(data).toEqual({
      parameter: {
        count: 2,
        verb: 'shared',
        noun: 'file',
      },
      key: 'verb-numerals-noun',
    });
  });
});
