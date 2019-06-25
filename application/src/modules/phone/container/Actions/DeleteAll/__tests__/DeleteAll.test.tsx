/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-31 12:59:32
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import { mountWithTheme, asyncMountWithTheme } from 'shield/utils';
import { JuiMenuItem } from 'jui/components/Menus';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { Trans } from 'react-i18next';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { DeleteAll } from '../DeleteAll';
import { DeleteAllView } from '../DeleteAll.View';

jest.mock('@/containers/Dialog');
jest.mock('react-i18next');
(Trans as jest.Mock) = jest.fn();

const deleteDialogConfig = {
  modalProps: { 'data-test-automation-id': 'deleteAllCallLogConfirmDialog' },
  okBtnProps: { 'data-test-automation-id': 'deleteAllCallLogOkButton' },
  cancelBtnProps: { 'data-test-automation-id': 'deleteAllCallLogCancelButton' },
  cancelText: 'common.dialog.cancel',
  content: (
    <JuiDialogContentText>
      <Trans i18nKey='calllog.doYouWanttoDeleteAllCallLog' />
    </JuiDialogContentText>
  ),
  okText: 'common.dialog.delete',
  okType: 'negative',
  title: 'calllog.deleteAllCallHistory',
};

describe('DeleteAllView', () => {
  @testable
  class init {
    @test('should render delete all history when click more button [JPT-2351]')
    t1() {
      const wrapper = mountWithTheme(<DeleteAllView totalCount={() => {}} />);
      const button = wrapper.find(JuiMenuItem);
      const buttonProps = button.props();
      expect(button.text()).toBe('calllog.deleteAllCallHistory');
      expect(buttonProps['aria-label']).toBe('calllog.deleteCallHistory');
    }
  }

  @testable
  class showDialog {
    @test(
      'should dialog show up when user click delete all menu item [JPT-2348]',
    )
    t1() {
      const wrapper = mountWithTheme(<DeleteAllView totalCount={() => {}} />);
      wrapper.find(JuiMenuItem).simulate('click');
      expect(Dialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining(deleteDialogConfig),
      );
    }
  }

  @testable
  class disabled {
    @test('should be false if has history [JPT-2341]')
    @mockService(CallLogService, 'getTotalCount', 1)
    async t1() {
      const wrapper = await asyncMountWithTheme(<DeleteAll />);
      await wrapper.update();
      const button = wrapper.find(JuiMenuItem);
      expect(button.props().disabled).toBeFalsy();
    }
  }
});
