/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-05 15:25:34
 * Copyright © RingCentral. All rights reserved.
 */

import { testable, test } from 'shield';
import {
  HoverControllerViewModel,
  InvalidIndexPath,
  DefaultIndexPath,
} from '../HoverController.ViewModel';

const vm = new HoverControllerViewModel();
const arr = [0, 1, 2];

describe('HoverController', () => {
  @testable
  class selectIndex {
    @test(`should selectIndex be ${DefaultIndexPath} when init`)
    t1() {
      expect(vm.selectIndex).toBe(DefaultIndexPath);
    }
  }

  @testable
  class updateCacheIndex {
    @test('should updateCacheIndex set map correct when init')
    t1() {
      arr.forEach(vm.updateCacheIndex);
      arr.forEach((value: number) => {
        expect(vm.cacheMap.get(arr[value].toString())).toBeInstanceOf(Function);
      });
    }
  }

  @testable
  class setSelectIndex {
    @test(
      'should setSelectIndex set selectIndex correct when call setSelectIndex',
    )
    t1() {
      arr.forEach(vm.updateCacheIndex);
      expect(vm.selectIndex).toEqual(DefaultIndexPath);
      vm.setSelectIndex(arr[0]);
      expect(vm.selectIndex).toEqual(arr[0]);
    }
  }

  @testable
  class resetSelectIndex {
    @test(
      `should selectIndex be ${InvalidIndexPath} when call resetSelectIndex`,
    )
    t1() {
      arr.forEach(vm.updateCacheIndex);
      vm.setSelectIndex(arr[0]);
      expect(vm.selectIndex).toEqual(arr[0]);
      vm.resetSelectIndex();
      expect(vm.selectIndex).toEqual(InvalidIndexPath);
    }
  }

  @testable
  class setSelectIndexToDefault {
    @test(
      `should selectIndex be ${DefaultIndexPath} when call setSelectIndexToDefault`,
    )
    t1() {
      arr.forEach(vm.updateCacheIndex);
      vm.setSelectIndex(arr[0]);
      expect(vm.selectIndex).toEqual(arr[0]);
      vm.setSelectIndexToDefault();
      expect(vm.selectIndex).toEqual(DefaultIndexPath);
    }
  }

  @testable
  class isHover {
    @test('should return false when cellIndex does not equal to selectIndex')
    t1() {
      arr.forEach(vm.updateCacheIndex);
      vm.setSelectIndex(arr[0]);
      expect(vm.selectIndex).toEqual(arr[0]);
      expect(arr[1]).not.toEqual(arr[0]);
      expect(vm.isHover(arr[1])).toBeFalsy();
    }

    @test('should return true when cellIndex equal to selectIndex')
    t2() {
      arr.forEach(vm.updateCacheIndex);
      vm.setSelectIndex(arr[0]);
      expect(vm.selectIndex).toEqual(arr[0]);
      expect(vm.isHover(arr[0])).toBeTruthy();
    }
  }
});
