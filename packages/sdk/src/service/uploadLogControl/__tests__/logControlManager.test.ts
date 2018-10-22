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

  describe('logIsEmpty', () => {
    it('is empty', () => {
      const logs = {
        MAIN: [],
        NETWORK: [],
      };
      expect(LogControlManager.instance().logIsEmpty(logs)).toBeTruthy();
    });
    it('is not empty', () => {
      const logs = {
        MAIN: [],
        NETWORK: ['1'],
      };
      expect(LogControlManager.instance().logIsEmpty(logs)).toBeFalsy();
    });
  });
  describe('do upload', () => {
    it('do upload', async () => {
      LogControlManager.instance().doUpload = jest.fn();
      LogControlManager.instance().logIsEmpty = jest.fn();
      LogControlManager.instance().logIsEmpty.mockReturnValueOnce(false);
      await LogControlManager.instance().flush();
      expect(LogControlManager.instance().doUpload).toHaveBeenCalled();
    });
  });
});
