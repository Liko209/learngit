/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 14:55:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { Voicemail } from '../Voicemail';
import { test, testable } from 'shield';
import { mountWithTheme } from 'shield/utils';

describe('Voicemail', () => {
  // will remove until upgrade material ui
  beforeAll(() => {
    // mock console for jest
    (global as any)['console'] = {
      error: jest.fn(),
    };
  });
  @testable
  class init {
    @test('should create a CallHistory instance when mount')
    t1() {
      const wrapper = mountWithTheme(<Voicemail />);
      expect(wrapper).toBeTruthy();
    }
  }
});
