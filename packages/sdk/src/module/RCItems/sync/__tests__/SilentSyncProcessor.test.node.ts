/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 06:17:28
 * Copyright © RingCentral. All rights reserved.
 */

import { SilentSyncProcessor } from '../SilentSyncProcessor';

describe('SilentSyncProcessor', () => {
  let processor: SilentSyncProcessor;
  const mockProcessFunc = jest.fn();

  beforeEach(() => {
    processor = new SilentSyncProcessor('test', mockProcessFunc);
  });

  describe('process', () => {
    it('should call process func', async () => {
      await processor.process();
      expect(mockProcessFunc).toBeCalledTimes(1);
    });
  });

  describe('name', () => {
    it('should return name', async () => {
      expect(await processor.name()).toEqual('test');
    });
  });
});
