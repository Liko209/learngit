/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-31 12:59:32
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { testable, test } from 'shield';
import { mountWithTheme } from 'shield/utils';
import { mockService } from 'shield/sdk';
import { mockEntity } from 'shield/application';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { READ_STATUS } from 'sdk/module/RCItems/constants';
import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { Read } from '../Read';
import { BUTTON_TYPE } from '../types';
import { ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('@/containers/Notification');

const networkErrorFunc = () => {
  throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
};

const serverErrorFunc = () => {
  throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
};

const checkNotification = (message: string) => ({
  message,
  autoHideDuration: 3000,
  dismissible: false,
  fullWidth: false,
  messageAlign: "left",
  type: "error",
})

describe('Read', () => {
  @testable
  class init {
    @test('should render current when button is icon type under read status')
    @mockEntity({
      readStatus: READ_STATUS.READ,
    })
    t1() {
      const wrapper = mountWithTheme(<Read id={1234} type={BUTTON_TYPE.ICON} />);
      const buttonProps = wrapper.find(JuiIconButton).props();
      expect(buttonProps.children).toBe('unread');
      expect(buttonProps.tooltipTitle).toBe('voicemail.markUnread');
      expect(buttonProps.ariaLabel).toBe('voicemail.messageIsReadMarkItAsUnread');
    }

    @test('should render current when button is icon type under unread status')
    @mockEntity({
      readStatus: READ_STATUS.UNREAD,
    })
    t2() {
      const wrapper = mountWithTheme(<Read id={1234} type={BUTTON_TYPE.ICON} />);
      const buttonProps = wrapper.find(JuiIconButton).props();
      expect(buttonProps.children).toBe('read');
      expect(buttonProps.tooltipTitle).toBe('voicemail.markRead');
      expect(buttonProps.ariaLabel).toBe('voicemail.messageIsUnreadMarkItAsRead');
    }

    @test('should render current when button is menu item type under read status')
    @mockEntity({
      readStatus: READ_STATUS.READ,
    })
    t3() {
      const wrapper = mountWithTheme(<Read id={1234} type={BUTTON_TYPE.MENU_ITEM} />);
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(button.text()).toBe('voicemail.markUnread');
      expect(buttonProps.icon).toBe('read');
      expect(buttonProps['aria-label']).toBe('voicemail.messageIsReadMarkItAsUnread');
    }

    @test('should render current when button is menu item type under unread status')
    @mockEntity({
      readStatus: READ_STATUS.UNREAD,
    })
    t4() {
      const wrapper = mountWithTheme(<Read id={1234} type={BUTTON_TYPE.MENU_ITEM} />);
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(button.text()).toBe('voicemail.markRead');
      expect(buttonProps.icon).toBe('unread');
      expect(buttonProps['aria-label']).toBe('voicemail.messageIsUnreadMarkItAsRead');
    }
  }

  @testable
  class read {
    @test('should toast error when unread message fail for network issue [JPT-2241]')
    @mockEntity({
      readStatus: READ_STATUS.READ,
    })
    @mockService(VoicemailService, 'updateReadStatus', networkErrorFunc)
    async t1() {
      const wrapper = mountWithTheme(<Read id={1234} type={BUTTON_TYPE.MENU_ITEM} />);
      await wrapper.find(JuiMenuItem).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('voicemail.prompt.notAbleToUnreadVoicemalForNetworkIssue')
      );
    }

    @test('should toast error when unread message fail for server issue [JPT-2240]')
    @mockEntity({
      readStatus: READ_STATUS.READ,
    })
    @mockService(VoicemailService, 'updateReadStatus', serverErrorFunc)
    async t2() {
      const wrapper = mountWithTheme(<Read id={1234} type={BUTTON_TYPE.ICON} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('voicemail.prompt.notAbleToUnreadVoicemalForServerIssue')
      );
    }

    @test('should toast error when read message fail for network issue [JPT-2241]')
    @mockEntity({
      readStatus: READ_STATUS.UNREAD,
    })
    @mockService(VoicemailService, 'updateReadStatus', networkErrorFunc)
    async t3() {
      const wrapper = mountWithTheme(<Read id={1234} type={BUTTON_TYPE.MENU_ITEM} />);
      await wrapper.find(JuiMenuItem).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('voicemail.prompt.notAbleToReadVoicemailForNetworkIssue')
      );
    }

    @test('should toast error when read message fail for server issue [JPT-2240]')
    @mockEntity({
      readStatus: READ_STATUS.UNREAD,
    })
    @mockService(VoicemailService, 'updateReadStatus', serverErrorFunc)
    async t4() {
      const wrapper = mountWithTheme(<Read id={1234} type={BUTTON_TYPE.ICON} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('voicemail.prompt.notAbleToReadVoicemailForServerIssue')
      );
    }
  }
})
