/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-12 16:15:14
 * Copyright © RingCentral. All rights reserved
*/

import axios from 'axios';
import LogControlManager from '../logControlManager';
jest.mock('axios');

describe('LogControlManager', () => {
  axios.mockResolvedValue({});
  it('instance', async () => {
    expect(LogControlManager.instance()).toBeInstanceOf(LogControlManager);
  });

});
