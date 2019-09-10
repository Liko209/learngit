/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 14:01:25
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { globalKeysManager } from '../globalKeyManager';
import { isDialogOpen } from '@/containers/Dialog/utils';
import Mousetrap from 'mousetrap';

jest.mock('@/containers/Dialog/utils');
jest.mock('mousetrap');

describe('globalKeysManager', () => {
  @testable
  class addGlobalKey {
    @test('should be check conflict and bind key if add a global key')
    t1() {
      const handler = jest.fn();
      jest.spyOn(globalKeysManager, 'checkConflict').mockImplementation();
      globalKeysManager.addGlobalKey('t', handler);
      expect(globalKeysManager.checkConflict).toHaveBeenCalled();
    }
  }
});
