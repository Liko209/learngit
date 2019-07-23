/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-02 11:10:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ElectronUpgradeDialogComponent } from '../ElectronUpgradeDialog.View';
import { mountWithTheme } from 'shield/utils';

const baseProps = {
  t: (str: string) => str,
};
// skip due to MUI upgrade, ticket number FIJI-7745
describe.skip('ElectronUpgradeDialog.View', () => {
  describe('ElectronUpgradeDialog.View', () => {
    it('should model be rendered correctly when force upgrade', () => {
      const props = { ...baseProps };

      const wrapper = mountWithTheme(
        <ElectronUpgradeDialogComponent {...props} />,
      );

      expect(wrapper.contains('electron.upgrade.dialogTitle')).toBe(true);
      expect(wrapper.contains('electron.upgrade.dialogMessage')).toBe(true);
      expect(wrapper.contains('electron.upgrade.upgrade')).toBe(true);
    });
  });
});
