/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-26 10:18:55
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockContainer } from 'shield/application';
import { HomeViewModel } from '../Home.ViewModel';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';

describe('HomeViewModel', () => {
  const telephonyService = {
    name: TELEPHONY_SERVICE,
    needConfirmE911() {},
    openE911() {},
  };
  @testable
  class showGlobalSearch {
    @test('should be true if global search store open = true')
    @mockContainer(GlobalSearchStore, 'open.get', true)
    t1() {
      const vm = new HomeViewModel();
      expect(vm.showGlobalSearch).toBeTruthy();
    }
  }

  @testable
  class dispose {
    @test('should be call _unListen if dispose')
    t1() {
      const vm = new HomeViewModel();
      jest.spyOn(vm, '_unListen');
      vm.dispose();
      expect(vm._unListen).toHaveBeenCalled();
    }
  }

  @testable
  class openE911 {
    @test('should be call openE911 if openE911')
    @mockContainer(telephonyService, 'openE911')
    t1() {
      const vm = new HomeViewModel();
      vm.openE911();
      expect(telephonyService.openE911).toHaveBeenCalled();
    }
  }

  @testable
  class needConfirmE911 {
    @test('should be call needConfirmE911 if needConfirmE911')
    @mockContainer(telephonyService, 'needConfirmE911')
    async t1() {
      const vm = new HomeViewModel();
      vm.needConfirmE911();
      expect(telephonyService.needConfirmE911).toHaveBeenCalled();
    }
  }
});
