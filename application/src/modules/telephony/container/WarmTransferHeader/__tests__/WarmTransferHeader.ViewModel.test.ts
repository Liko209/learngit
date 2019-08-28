/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-28 02:17:01
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
// import { globalStore } from 'shield/integration-test';
// import { mockEntity } from 'shield/application';
// import { mockService } from 'shield/sdk';
import { WarmTransferHeaderViewModel } from '../WarmTransferHeader.ViewModel';

let vm: WarmTransferHeaderViewModel;

describe('WarmTransferHeaderViewModel', () => {
  @testable
  class _viewModelMethods {
    @test('should return true while ViewModel exist')
    //@mockService()
    //@mockEntity()
    t1() {
      const vm = new WarmTransferHeaderViewModel({ id: 1 });
      expect(vm).toBeTruthy();
    }
  }
});
