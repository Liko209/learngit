/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-02 11:10:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ElectronUpgradeDialogComponent } from '../ElectronUpgradeDialog.View';
import { mount } from 'enzyme';
import { UpgradeType } from '../types';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../../../../__tests__/utils';
import { TopBannerViewModel } from '@/modules/app/container/TopBanner/TopBanner.ViewModel';

const mountWithTheme = (content: React.ReactNode) =>
  mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);

const baseProps = {
  t: (str: string) => str,
};
describe('ElectronUpgradeDialog.View', () => {
  it('should render correctly when first time appearance for force upgrade', () => {
    const props = {
      ...baseProps,
      needUpgrade: true,
      type: UpgradeType.FORCE,
      snoozed: false,
      url: '',
    };
    const wrapper = mountWithTheme(
      <ElectronUpgradeDialogComponent {...props} />,
    );
    expect(wrapper.contains('electron.upgrade.dialogTitle')).toBe(true);
    expect(wrapper.contains('electron.upgrade.dialogMessage')).toBe(true);
    expect(wrapper.contains('electron.upgrade.ignoreOnce')).toBe(true);
    expect(wrapper.contains('electron.upgrade.upgrade')).toBe(true);
  });

  it('should show banner when user click ignore once button', () => {
    TopBannerViewModel.showBanner = jest.fn();
    window.jupiterElectron = {};
    const props = {
      ...baseProps,
      needUpgrade: true,
      type: UpgradeType.FORCE,
      snoozed: false,
      url: '',
    };
    const wrapper = mountWithTheme(
      <ElectronUpgradeDialogComponent {...props} />,
    );
    wrapper
      .find('button')
      .at(0)
      .simulate('click');
    expect(TopBannerViewModel.showBanner).toHaveBeenCalled();
  });

  it('should render correctly (no ignore once button) after snoozed for force upgrade', () => {
    const props = {
      ...baseProps,
      needUpgrade: true,
      type: UpgradeType.FORCE,
      snoozed: true,
      url: '',
    };
    const wrapper = mountWithTheme(
      <ElectronUpgradeDialogComponent {...props} />,
    );
    expect(wrapper.contains('electron.upgrade.dialogTitle')).toBe(true);
    expect(wrapper.contains('electron.upgrade.dialogMessage')).toBe(true);
    expect(wrapper.contains('electron.upgrade.ignoreOnce')).toBe(false);
    expect(wrapper.contains('electron.upgrade.upgrade')).toBe(true);
  });

  it('should render correctly when need soft upgrade', () => {
    const props = {
      ...baseProps,
      needUpgrade: true,
      type: UpgradeType.SOFT,
      snoozed: false,
      url: '',
    };
    const wrapper = mountWithTheme(
      <ElectronUpgradeDialogComponent {...props} />,
    );
    expect(wrapper.contains('electron.upgrade.dialogTitle')).toBe(true);
    expect(wrapper.contains('electron.upgrade.dialogMessage')).toBe(true);
    expect(wrapper.contains('electron.upgrade.notNow')).toBe(true);
    expect(wrapper.contains('electron.upgrade.ignore')).toBe(true);
    expect(wrapper.contains('electron.upgrade.upgrade')).toBe(true);
  });
});
