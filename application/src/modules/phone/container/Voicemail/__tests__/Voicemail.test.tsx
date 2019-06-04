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
  @testable
  class init {
    @test('should create a CallHistory instance when mount')
    t1() {
      const wrapper = mountWithTheme(<Voicemail />);
      expect(wrapper).toBeTruthy();
    }
  }
});
