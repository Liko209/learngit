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
    expect(LogControlManager.Instance()).toBeInstanceOf(LogControlManager);
  });

  describe('logIsEmpty', () => {
    it('is empty', () => {
      const logs = {
        MAIN: [],
        NETWORK: []
      };
      expect(LogControlManager.Instance().logIsEmpty(logs)).toBeTruthy();
    });
    it('is not empty', () => {
      const logs = {
        MAIN: [],
        NETWORK: ['1']
      };
      expect(LogControlManager.Instance().logIsEmpty(logs)).toBeFalsy();
    });
  });
  describe('do upload', () => {
    it('do upload', async () => {
      LogControlManager.Instance().doUpload = jest.fn();
      LogControlManager.Instance().logIsEmpty = jest.fn();
      LogControlManager.Instance().logIsEmpty.mockReturnValueOnce(false);
      await LogControlManager.Instance().flush();
      expect(LogControlManager.Instance().doUpload).toHaveBeenCalled();
    });
  });
});
