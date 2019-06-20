/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 09:42:12
 * Copyright © RingCentral. All rights reserved.
 */
import { isValidTab, getValidPath } from '../helper';
import { TelephonyTabs, kDefaultPhoneTabPath } from '../config';
import { test, testable } from 'shield';

describe('isValidTab', () => {
  @testable
  class t1 {
    @test('should return true if path is `callhistory` or `voicemail` ')
    t1() {
      TelephonyTabs.forEach(({ path }) =>
        expect(isValidTab(path)).toBeTruthy(),
      );
    }

    @test('should return false if path is invalid')
    t2() {
      expect(isValidTab('')).toBeFalsy();
      expect(isValidTab('a')).toBeFalsy();
    }
  }
});

describe('getValidPath', () => {
  @testable
  class t1 {
    @test(
      'should return original path if path is `callhistory` or `voicemail` ',
    )
    t1() {
      TelephonyTabs.forEach(({ path }) =>
        expect(getValidPath(path)).toEqual(path),
      );
    }

    @test('should return default path if path is invalid')
    t2() {
      expect(getValidPath('')).toEqual(kDefaultPhoneTabPath);
      expect(getValidPath('a')).toEqual(kDefaultPhoneTabPath);
    }
  }
});
