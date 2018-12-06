/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-06 14:46:54
 * Copyright © RingCentral. All rights reserved.
 */

import UploadProgressModel from '../UploadProgress';
import { Progress } from 'sdk/src/models';

describe('UploadProgressModel', () => {
  describe('progress()', () => {
    it('should return file uploading progress base on `loaded` & `total`', () => {
      const progress1 = { id: 10, total: 100, loaded: 0 };
      const progress2 = { id: 10, total: 100, loaded: 100 };
      const m1 = UploadProgressModel.fromJS(progress1 as Progress);
      const m2 = UploadProgressModel.fromJS(progress2 as Progress);
      expect(m1.progress).toEqual(0);
      expect(m2.progress).toEqual(1);
    });

    it('should return 0 for negative `loaded`', () => {
      const progress1 = { id: 10, total: 100, loaded: -1 };
      const m1 = UploadProgressModel.fromJS(progress1 as Progress);
      expect(m1.progress).toEqual(0);
    });

    it('should return 1 when `loaded` > `total`', () => {
      const progress1 = { id: 10, total: 100, loaded: 1001 };
      const m1 = UploadProgressModel.fromJS(progress1 as Progress);
      expect(m1.progress).toEqual(1);
    });
  });
});
