/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-05-31 14:02:42
 * Copyright © RingCentral. All rights reserved.
 */

import { generateLocalizationKey } from '../generateLocalizationKey';

describe('generateLocalizationKey', () => {
  it('Should replace all the key words by parameter value', () => {
    const inputA = {
      key: 'verb-noun-adjective-user',
      parameter: {
        verb: 'make',
        noun: 'something',
        adjective: 'status',
        user: 'somebody',
      },
    };
    const output = generateLocalizationKey(inputA.key, inputA.parameter);
    expect(output).toEqual('item.activity.make something status for {{user}}');
  });
});
