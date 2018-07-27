/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import CompanyAPI from '../company';
import Api from '../../api';

jest.mock('../../api');

describe('CompanyAPI', () => {
  describe('requestCompanyById()', () => {
    it('glipNetworkClient getDataById() should be called with specific path', () => {
      CompanyAPI.requestCompanyById(2);
      expect(Api.getDataById).toHaveBeenCalledWith(2);
    });
  });
});
