/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 23:07:04
 * Copyright © RingCentral. All rights reserved.
 */

import { HealthModuleManager, BaseHealthModule } from 'foundation/health';
import { HealthStatusItemProvider } from '../HealthStatusItemProvider';

describe('HealthStatusItemProvider', () => {
  describe('getZipItems()', () => {
    it('should getZipItems', async () => {
      const provider = new HealthStatusItemProvider();
      const module1 = new BaseHealthModule(Symbol('xx'), 'xx');
      HealthModuleManager.getInstance().register(module1);
      module1.register({
        name: 'test',
        getStatus: async () => 'status',
      });
      const result = await provider.getZipItems();
      expect(result.length).toEqual(1);
      expect(result[0].type).toEqual('.txt');
      expect(result[0].name).toEqual('HealthStatus');
    });
  });
});
