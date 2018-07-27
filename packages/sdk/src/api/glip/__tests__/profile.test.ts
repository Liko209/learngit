/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import ProfileAPI from '../profile';
import Api from '../../api';

jest.mock('../../api');

describe('ProfileAPI', () => {
  describe('requestProfileById()', () => {
    it('glipNetworkClient getDataById() should be called with specific path', () => {
      ProfileAPI.requestProfileById(5);
      expect(Api.getDataById).toHaveBeenCalledWith(5);
    });
  });
});
