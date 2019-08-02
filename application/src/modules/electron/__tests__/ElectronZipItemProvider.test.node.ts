/*
 * @Author: Paynter Chen
 * @Date: 2019-05-06 08:56:20
 * Copyright © RingCentral. All rights reserved.
 */
import { ElectronZipItemProvider } from '../ElectronZipItemProvider';

describe('ElectronZipItemProvider ', () => {
  describe('getZipItems()', () => {
    it('should getZipItems from memoryCollector', async () => {
      window.jupiterElectron = {
        getLogs: () => [{ message: 'test' }],
      };
      const provider = new ElectronZipItemProvider();
      const result = await provider.getZipItems();
      expect(result.length).toEqual(1);
      expect(result[0].type).toEqual('.txt');
      expect(result[0].name).toEqual('ElectronLog');
    });
  });
});
