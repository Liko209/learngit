/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-27 14:23:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { JuiIconButton } from 'jui/components/Buttons';
import { mountWithTheme } from 'shield/utils';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { Message } from '../Message';

jest.mock('@/common/goToConversation');

describe('message', () => {
  @testable
  class goToConversation {
    @test('should go to conversation if has id [JPT-2880]')
    t1() {
      const wrapper = mountWithTheme(
        <Message id={123} type={BUTTON_TYPE.ICON} />,
      );
      wrapper.find(JuiIconButton).simulate('click');
      expect(goToConversationWithLoading).toHaveBeenCalledWith({ id: 123 });
    }
  }
});
