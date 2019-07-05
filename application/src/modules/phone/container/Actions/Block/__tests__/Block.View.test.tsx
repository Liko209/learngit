/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-25 10:25:30
 * Copyright © RingCentral. All rights reserved.
 */

import { shallow } from 'enzyme';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { Dialog } from '@/containers/Dialog';
import React from 'react';
import { testable, test } from 'shield';
import { mountWithTheme } from 'shield/utils';
import { Caller } from 'sdk/module/RCItems/types';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { BlockView } from '../Block.View';

jest.mock('@/containers/Dialog');
jest.mock('@/containers/Notification');

const dialogConfig = {
  modalProps: { 'data-test-automation-id': 'blockNumberConfirmDialog' },
  okBtnProps: { 'data-test-automation-id': 'blockNumberOkButton' },
  cancelBtnProps: { 'data-test-automation-id': 'blockNumberCancelButton' },
  cancelText: 'common.dialog.cancel',
  content: (
    <JuiDialogContentText>
      phone.numberWillNotBeAbletoReachYouIfBlockedDoYouWanttoBlockIt
    </JuiDialogContentText>
  ),
  okText: 'phone.block',
  okType: 'negative',
  title: 'phone.blockThisNumber',
};

const checkNotification = (message: string) => ({
  message,
  dismissible: false,
  fullWidth: false,
  messageAlign: 'left',
  type: 'success',
});

const phoneNumber = '+1234567890';

const mockProps = {
  phoneNumber,
  id: 1234,
  block: () => jest.fn().mockReturnValue(true),
  unblock: () => jest.fn().mockReturnValue(true),
  caller: {
    phoneNumber
  } as Caller,
};

describe('Block', () => {
  @testable
  class init {
    @test(
      'should render correct when button is icon type under block status [JPT-2408-Step1/JPT-2462]',
    )
    t1() {
      const wrapper = mountWithTheme(
        <BlockView {...mockProps} type={BUTTON_TYPE.ICON} isBlocked={true} />,
      );
      const buttonProps = wrapper.find(JuiIconButton).props();
      expect(buttonProps.children).toBe('unblocked');
      expect(buttonProps.tooltipTitle).toBe('phone.unblockNumber');
      expect(buttonProps.ariaLabel).toBe('phone.unblockNumber');
    }

    @test(
      'should render correct when button is icon type under unblock status [JPT-2409-Step1/JPT-2462]',
    )
    t2() {
      const wrapper = mountWithTheme(
        <BlockView {...mockProps} type={BUTTON_TYPE.ICON} isBlocked={false} />,
      );
      const buttonProps = wrapper.find(JuiIconButton).props();
      expect(buttonProps.children).toBe('blocked');
      expect(buttonProps.tooltipTitle).toBe('phone.blockNumber');
      expect(buttonProps.ariaLabel).toBe('phone.blockNumber');
    }

    @test(
      'should render correct when button is menu item type under block status [JPT-2408-Step1]',
    )
    t3() {
      const wrapper = mountWithTheme(
        <BlockView
          {...mockProps}
          type={BUTTON_TYPE.MENU_ITEM}
          isBlocked={true}
        />,
      );
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(buttonProps.icon).toBe('unblocked');
      expect(button.text()).toBe('phone.unblockNumber');
      expect(buttonProps['aria-label']).toBe('phone.unblockNumber');
    }

    @test(
      'should render correct when button is menu item type under unblock status [JPT-2409-Step1]',
    )
    t4() {
      const wrapper = mountWithTheme(
        <BlockView
          {...mockProps}
          type={BUTTON_TYPE.MENU_ITEM}
          isBlocked={false}
        />,
      );
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(button.text()).toBe('phone.blockNumber');
      expect(buttonProps.icon).toBe('blocked');
      expect(buttonProps['aria-label']).toBe('phone.blockNumber');
    }
  }

  @testable
  class block {
    @test(
      'should show block confirm dialog when when button is icon item type [JPT-2410/JPT-2411]',
    )
    async t1() {
      const wrapper = shallow(
        <BlockView {...mockProps} type={BUTTON_TYPE.ICON} isBlocked={false} />,
      );
      await wrapper.simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining(dialogConfig),
      );
    }

    @test(
      'should show block confirm dialog when when button is menu item type [JPT-2410/JPT-2411]',
    )
    async t2() {
      const wrapper = shallow(
        <BlockView
          {...mockProps}
          type={BUTTON_TYPE.MENU_ITEM}
          isBlocked={false}
        />,
      );
      await wrapper.simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining(dialogConfig),
      );
    }

    @test(
      'should the user be prompted with a flash success toast when the number is blocked successfully [JPT-2408-Step4]',
    )
    async t3() {
      const wrapper = shallow(
        <BlockView {...mockProps} type={BUTTON_TYPE.ICON} isBlocked={false} />,
      );
      await wrapper.instance().onBlockConfirm({
        startLoading() { },
        stopLoading() { },
      });
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.numberHasBeenBlocked'),
      );
    }
  }

  @testable
  class unblock {
    @test(
      'should the user be prompted with a flash success toast when the number is unblocked successfully  [JPT-2409-Step2]',
    )
    async t1() {
      const wrapper = shallow(
        <BlockView {...mockProps} type={BUTTON_TYPE.ICON} isBlocked={true} />,
      );
      await wrapper.simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.numberHasBeenUnblocked'),
      );
    }

    @test('should not show flash toast when unblock fail')
    async t2() {
      const fn = () => false;
      const wrapper = shallow(
        <BlockView unblock={fn} type={BUTTON_TYPE.ICON} isBlocked={true} />,
      );
      await wrapper.simulate('click');
      expect(Notification.flashToast).not.toHaveBeenCalled();
    }
  }
});
