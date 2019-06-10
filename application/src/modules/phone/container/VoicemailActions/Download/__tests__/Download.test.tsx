/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-04 20:23:00
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { testable, test } from 'shield';
import { mountWithTheme } from 'shield/utils';
import { mockEntity } from 'shield/application';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiIconButton } from 'jui/components/Buttons';
import { Download } from '../Download';
import { BUTTON_TYPE } from '../types';
import { ATTACHMENT_TYPE } from 'sdk/module/RCItems/constants';

const mockEntityData = {
  attachments: [{
    uri: 'uri',
    type: ATTACHMENT_TYPE.AUDIO_RECORDING
  }],
}

describe('Download', () => {
  @testable
  class init {
    @test('should render current when button is icon type')
    @mockEntity(mockEntityData)
    t1() {
      const wrapper = mountWithTheme(<Download id={1234} type={BUTTON_TYPE.ICON} />);
      const buttonProps = wrapper.find(JuiIconButton).props();
      expect(buttonProps.children).toBe('download');
      expect(buttonProps.tooltipTitle).toBe('common.download');
      expect(buttonProps.ariaLabel).toBe('voicemail.downloadVoicemail');
    }

    @test('should render current when button is menu item type')
    @mockEntity(mockEntityData)
    t2() {
      const wrapper = mountWithTheme(<Download id={1234} type={BUTTON_TYPE.MENU_ITEM} />);
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(button.text()).toBe('voicemail.downloadVoicemail');
      expect(buttonProps.icon).toBe('download');
      expect(buttonProps['aria-label']).toBe('voicemail.downloadVoicemail');
    }
  }
})
