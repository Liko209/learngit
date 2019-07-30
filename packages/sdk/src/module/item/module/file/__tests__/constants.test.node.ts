/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 21:38:51
 * Copyright © RingCentral. All rights reserved.
 */

import { FILE_FORM_DATA_KEYS } from '../constants';
describe('constants', () => {
  describe('FILE_FORM_DATA_KEYS', () => {
    it('should return expected value ', () => {
      expect(FILE_FORM_DATA_KEYS.CONTENT_TYPE).toEqual('Content-type');
      expect(FILE_FORM_DATA_KEYS.FILE).toEqual('file');
    });
  });
});
