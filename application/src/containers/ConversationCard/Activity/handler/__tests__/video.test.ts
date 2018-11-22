/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:34
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../../types';

import video from '../video';

describe('Video', () => {
  it('Should return a object that contains action is equal to the ACTION.STARTED', () => {
    const data = video();
    expect(data.action).toEqual(ACTION.STARTED);
  });
});
