/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import PersonAPI from '../person';
import Api from '../../api';

jest.mock('../../api');

describe('PersonAPI', () => {
  describe('requestPersonById()', () => {
    it('glipNetworkClient getDataById() should be called with specific path', () => {
      PersonAPI.requestPersonById(4);
      expect(Api.getDataById).toHaveBeenCalledWith(4);
    });
  });
});
