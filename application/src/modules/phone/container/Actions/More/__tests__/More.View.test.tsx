/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-25 09:44:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { mountWithTheme } from 'shield/utils';
import { JuiIconButton } from 'jui/components/Buttons';
import { MoreView } from '../More.View';

describe('MoreView', () => {
  @testable
  class render {
    @test(
      'should be current text when show tooltip or screen reader [JPT-2339][JPT-2350]',
    )
    t1() {
      const wrapper = mountWithTheme(<MoreView />);
      expect(wrapper.find(JuiIconButton).props().tooltipTitle).toBe(
        'voicemail.more',
      );
      expect(wrapper.find(JuiIconButton).props().ariaLabel).toBe(
        'voicemail.more',
      );
    }
  }
});
