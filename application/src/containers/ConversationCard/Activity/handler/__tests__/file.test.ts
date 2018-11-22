/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../../types';

import file from '../file';

describe('File', () => {
  it('Should return a object that contains action is ACTION.UPLOADED and number is 2 when ids is [1] and itemData is {version_map: {1: 2}}', () => {
    const ids = [1];
    const itemData = {
      version_map: {
        1: 2,
      },
    };
    const activityData = file({ ids, itemData });
    expect(activityData.action).toEqual(ACTION.UPLOADED);
    expect(activityData.quantifier).toEqual(2);
  });
  it('Should return a object that contains action is ACTION.SHARED and number is 2 when ids is [1, 2] and itemData is {version_map: {1: 1, 2: 1}}', () => {
    const ids = [1, 2];
    const itemData = {
      version_map: {
        1: 1,
        2: 1,
      },
    };
    const activityData = file({ ids, itemData });
    expect(activityData.action).toEqual(ACTION.SHARED);
    expect(activityData.quantifier).toEqual(2);
  });
  it('Should return a object that contains action is ACTION.SHARED and number is 2 when ids is [1] and itemData is {version_map: {1: 1}}', () => {
    const ids = [1];
    const itemData = {
      version_map: {
        1: 1,
      },
    };
    const activityData = file({ ids, itemData });
    expect(activityData.action).toEqual(ACTION.SHARED);
    expect(activityData.quantifier).toEqual(1);
  });
});
