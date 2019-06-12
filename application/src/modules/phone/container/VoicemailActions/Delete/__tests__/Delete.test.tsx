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
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { Trans } from 'react-i18next';
import { Delete } from '../Delete';
import { BUTTON_TYPE } from '../types';

jest.mock('@/containers/Dialog');
jest.mock('react-i18next');
(Trans as jest.Mock) = jest.fn();

describe('Delete', () => {
  @testable
  class init {
    @test('should render current when button is icon type')
    t1() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.ICON} />);
      const buttonProps = wrapper.find(JuiIconButton).props();
      expect(buttonProps.children).toBe('delete');
      expect(buttonProps.tooltipTitle).toBe('voicemail.delete');
      expect(buttonProps.ariaLabel).toBe('voicemail.deleteVoicemail');
    }

    @test('should render current when button is menu item type')
    t2() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.MENU_ITEM} />);
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(button.text()).toBe('voicemail.deleteVoicemail');
      expect(buttonProps.icon).toBe('delete');
      expect(buttonProps['aria-label']).toBe('voicemail.deleteVoicemail');
    }
  }

  @testable
  class deleteVoicemail {
    @test('should dialog show up when user click menu item [JPT-2231/JPT-2232]')
    async t1() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.MENU_ITEM} />);
      await wrapper.find(JuiMenuItem).simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          cancelText: "common.dialog.cancel",
          content: (
            <JuiDialogContentText>
              <Trans
                i18nKey="voicemail.areYouSureYouWantToDeleteTheVoicemail"
              />
            </JuiDialogContentText>
          ),
          okText: "common.dialog.delete",
          okType: "negative",
          title: "voicemail.deleteVoicemail"
        })
      );
    }

    @test('should dialog show up when user click icon button [JPT-2231/JPT-2232]')
    async t2() {
      const wrapper = mountWithTheme(<Delete id={1234} type={BUTTON_TYPE.ICON} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          cancelText: "common.dialog.cancel",
          content: (
            <JuiDialogContentText>
              <Trans
                i18nKey="voicemail.areYouSureYouWantToDeleteTheVoicemail"
              />
            </JuiDialogContentText>
          ),
          okText: "common.dialog.delete",
          okType: "negative",
          title: "voicemail.deleteVoicemail"
        })
      );
    }
  }
})
