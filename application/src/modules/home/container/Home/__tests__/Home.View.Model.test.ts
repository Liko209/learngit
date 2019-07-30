/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-26 10:18:55
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockContainer } from 'shield/application';
import { HomeViewModel } from '../Home.ViewModel';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';

describe('HomeViewModel', () => {
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
});
