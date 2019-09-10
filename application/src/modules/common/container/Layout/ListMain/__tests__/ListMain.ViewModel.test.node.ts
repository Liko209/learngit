/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-26 20:42:47
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';

import { ListMainViewModel } from '../ListMain.ViewModel';

describe('ListMain.ViewModel', () => {
  @testable
  class setSearchKey {
    @test('should be change search key if typing some value [JPT-2931]')
    t1() {
      const props = {
        createHandler: jest.fn(),
        filter: {
          onChange: jest.fn(),
        },
      } as any;
      const vm = new ListMainViewModel(props);
      vm.setSearchKey('123');
      expect(vm.searchKey).toBe('123');
      expect(props.filter.onChange).toHaveBeenCalledWith('123');
    }
  }

  @testable
  class onErrorReload {
    @test('should be new handler if error')
    t1() {
      const props = {
        createHandler: jest.fn(),
      } as any;
      const vm = new ListMainViewModel(props);
      vm.onErrorReload('123');
      expect(props.isError).toBeFalsy();
      expect(props.createHandler).toHaveBeenCalled();
    }
  }

  @testable
  class createHandler {
    @test('should be set listhandler if ListMain mounted')
    t1() {
      const props = {
        createHandler: jest.fn().mockReturnValue({}),
      } as any;
      const vm = new ListMainViewModel(props);
      expect(vm.listHandler).toEqual({});
    }

    @test('should be error if createHandler throw error')
    t2() {
      const props = {
        createHandler: jest.fn().mockImplementation(() => {
          throw Error('e');
        }),
      } as any;
      let vm;
      try {
        vm = new ListMainViewModel(props);
      } catch (e) {
        expect(vm.isError).toBeTruthy();
      }
    }
  }

  @testable
  class initFilterKey {
    @test('should be set init search key if has initFilterKey [JPT-2931]')
    t1() {
      const props = {
        createHandler: jest.fn().mockReturnValue({}),
        filter: {
          initFilterKey() {
            return '1';
          },
        },
      } as any;
      const vm = new ListMainViewModel(props);
      expect(vm.searchKey).toBe('1');
    }
  }
});
