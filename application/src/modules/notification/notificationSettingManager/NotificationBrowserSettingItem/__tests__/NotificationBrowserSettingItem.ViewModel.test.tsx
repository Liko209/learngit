/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-30 14:14:47
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationBrowserSettingItemViewModel } from '../NotificationBrowserSettingItem.ViewModel';

jest.mock('@/utils/i18nT', () => (key: string) => key);

function setUpMock() {
  NotificationBrowserSettingItemViewModel.prototype.settingItemEntity.valueSetter = jest.fn();
}

describe('NotificationBrowserSettingItemViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Should call valueSetter when call setToggleState', async () => {
    setUpMock();
    const vm = new NotificationBrowserSettingItemViewModel();
    await vm.setToggleState(true);
    expect(
      NotificationBrowserSettingItemViewModel.prototype.settingItemEntity
        .valueSetter,
    ).toHaveBeenCalledWith({ desktopNotifications: true });
  });
});
