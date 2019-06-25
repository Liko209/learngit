/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-31 12:59:32
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { testable, test } from 'shield';
import { mountWithTheme } from 'shield/utils';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiIconButton } from 'jui/components/Buttons';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { Delete } from '../Delete';
import { ENTITY_TYPE } from '../../../constants';

jest.mock('@/containers/Dialog');
jest.mock('react-i18next');

const deleteDialogConfig = {
  modalProps: { 'data-test-automation-id': 'deleteCallLogConfirmDialog' },
  okBtnProps: { 'data-test-automation-id': 'deleteCallLogOkButton' },
  cancelBtnProps: { 'data-test-automation-id': 'deleteCallLogCancelButton' },
  cancelText: "common.dialog.cancel",
  content: (
    <JuiDialogContentText>
      calllog.doYouWanttoDeleteThisCallLog
    </JuiDialogContentText>
  ),
  okText: "common.dialog.delete",
  okType: "negative",
  title: "calllog.deleteCallLog"
}

const deleteVoicemailDialogConfig = {
  modalProps: { 'data-test-automation-id': 'deleteVoicemailConfirmDialog' },
  okBtnProps: { 'data-test-automation-id': 'deleteVoicemailOkButton' },
  cancelBtnProps: { 'data-test-automation-id': 'deleteVoicemailCancelButton' },
  cancelText: "common.dialog.cancel",
  content: (
    <JuiDialogContentText>
      voicemail.areYouSureYouWantToDeleteTheVoicemail
    </JuiDialogContentText>
  ),
  okText: "common.dialog.delete",
  okType: "negative",
  title: "voicemail.deleteVoicemail"
}

describe('Delete', () => {
  @testable
  class init {
    @test('should render delete voicemail button when button is icon type')
    t1() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.ICON} entity={ENTITY_TYPE.VOICEMAIL} />);
      const buttonProps = wrapper.find(JuiIconButton).props();
      expect(buttonProps.children).toBe('delete');
      expect(buttonProps.tooltipTitle).toBe('common.delete');
      expect(buttonProps.ariaLabel).toBe('voicemail.deleteVoicemail');
    }

    @test('should render delete voicemail button when button is menu item type')
    t2() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.MENU_ITEM} entity={ENTITY_TYPE.VOICEMAIL} />);
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(button.text()).toBe('common.delete');
      expect(buttonProps.icon).toBe('delete');
      expect(buttonProps['aria-label']).toBe('voicemail.deleteVoicemail');
    }

    @test('should render delete call log button when button is icon type')
    t3() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.ICON} entity={ENTITY_TYPE.CALL_LOG} />);
      const buttonProps = wrapper.find(JuiIconButton).props();
      expect(buttonProps.children).toBe('delete');
      expect(buttonProps.tooltipTitle).toBe('calllog.deleteCallLog');
      expect(buttonProps.ariaLabel).toBe('calllog.deleteCallLog');
    }

    @test('should render delete call log button when button is menu item type')
    t4() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.MENU_ITEM} entity={ENTITY_TYPE.CALL_LOG} />);
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(button.text()).toBe('calllog.deleteCallLog');
      expect(buttonProps.icon).toBe('delete');
      expect(buttonProps['aria-label']).toBe('calllog.deleteCallLog');
    }
  }

  @testable
  class deleteVoicemail {
    @test('should dialog show up when user click delete voicemail menu item [JPT-2231/JPT-2232]')
    async t1() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.MENU_ITEM} entity={ENTITY_TYPE.VOICEMAIL} />);
      await wrapper.find(JuiMenuItem).simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining(deleteVoicemailDialogConfig)
      );
    }

    @test('should dialog show up when user click delete voicemail icon button [JPT-2231/JPT-2232]')
    async t2() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.ICON} entity={ENTITY_TYPE.VOICEMAIL} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining(deleteVoicemailDialogConfig)
      );
    }
  }

  @testable
  class deleteCallLog {
    @test('should dialog show up when user click delete call log menu item')
    async t1() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.MENU_ITEM} entity={ENTITY_TYPE.CALL_LOG} />);
      await wrapper.find(JuiMenuItem).simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining(deleteDialogConfig)
      );
    }

    @test('should dialog show up when user click delete call log icon button')
    async t2() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.ICON} entity={ENTITY_TYPE.CALL_LOG} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining(deleteDialogConfig)
      );
    }
  }
})
