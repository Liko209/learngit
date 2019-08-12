/*
 * @Author: Paynter Chen
 * @Date: 2019-08-10 11:12:10
 * Copyright © RingCentral. All rights reserved.
 */
import { Zip } from '../Zip';

describe('Zip', () => {
  describe('zip()', () => {
    it('should call ensureWorker then call zipWorker.zip()', async () => {
      const zip = new Zip();
      jest.spyOn(zip, 'ensureZipWorker').mockResolvedValue();
      zip.zipWorker = {
        zip: jest.fn().mockResolvedValue(222),
      };
      const result = await zip.zip(111 as any);
      expect(zip.ensureZipWorker).toHaveBeenCalledTimes(1);
      expect(result).toEqual(222);
    });
  });
});
