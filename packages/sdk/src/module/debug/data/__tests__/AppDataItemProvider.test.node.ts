/*
 * @Author: Paynter Chen
 * @Date: 2019-08-28 13:14:55
 * Copyright © RingCentral. All rights reserved.
 */

import { AppDataItemProvider } from '../AppDataItemProvider';

describe('AppDataItemProvider ', () => {
  describe('getZipItems()', () => {
    it('should getZipItems', async () => {
      const data = {
        getAppData: jest.fn(),
      };
      data.getAppData.mockResolvedValue('test');
      const provider = new AppDataItemProvider(data);
      const result = await provider.getZipItems();
      expect(result).toEqual([
        {
          type: '.zip',
          folder: 'AppData',
          name: 'data',
          content: 'test',
        },
      ]);
    });
  });
});
