/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 17:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingContainerViewModel } from '../SettingContainer.ViewModel';
import { getEntity } from '@/store/utils';
import { SETTING_LIST_TYPE } from '../SettingLeftRail/types';
import { Notification } from '@/containers/Notification';
import { JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import { SettingItemFocBuilder } from '../../SettingItemFocBuilder';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';

jest.mock('../../SettingItemFocBuilder', () => {
  const listHandle: any = {
    sortableListStore: {
      getIds: [101],
    },
    fetchData: jest.fn(),
    dispose: jest.fn(),
  };
  return {
    SettingItemFocBuilder: id => ({
      buildSettingItemFoc: () => listHandle,
    }),
  };
});

jest.mock('@/containers/Notification');

function getNewJServerError(code: string, message: string = '') {
  throw new JServerError(code, message);
}

jest.mock('@/store/utils');

type listStoreType = {
  height: number;
};

function toastParamsBuilder(message: string) {
  return {
    message,
    type: ToastType.ERROR,
    messageAlign: ToastMessageAlign.LEFT,
    fullWidth: false,
    dismissible: false,
    autoHideDuration: 3000,
  };
}

describe('SettingContainerViewModel', () => {
  describe('getCurrentTypeScrollHeight()', () => {
    const listStore = SettingContainerViewModel.settingListStore;
    const type = 'general' as SETTING_LIST_TYPE;
    const height = 100;

    it('should return right scroll height when it exist', () => {
      listStore.set(type, {
        height,
      });
      const model = new SettingContainerViewModel();
      expect(model.getCurrentTypeScrollHeight(type)).toEqual(height);
    });

    it('should return 0 when scroll height is not exist', () => {
      listStore.delete(type);
      const model = new SettingContainerViewModel();
      expect(model.getCurrentTypeScrollHeight(type)).toEqual(0);
    });
  });

  describe('getItem()', () => {
    it('should equal data when getItem by id', () => {
      const VM = new SettingContainerViewModel();
      const mockData = { id: 10, weight: 10, value: 10 };
      (getEntity as jest.Mock).mockReturnValue(mockData);
      const result = VM.getItem(10);
      expect(result).toEqual(mockData);
    });
  });
  describe('handleItemChange()', () => {
    it('should Display error when failed to change Caller ID due to unexpected errors [JPT-1784]', async () => {
      const VM = new SettingContainerViewModel();
      const valueSetter = (value: any) =>
        getNewJServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED);
      Notification.flashToast = jest.fn();
      const handleFun = VM.handleItemChange(valueSetter);
      await handleFun(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('setting.phone.general.callerID.errorText'),
      );
    });
  });

  describe('settingItemData()', () => {
    it('should return { sortItem: {}, sortSection: [101] } when valueType equal 0', () => {
      const VM = new SettingContainerViewModel();
      const mockData = { id: 10, valueType: 0 };
      (getEntity as jest.Mock).mockReturnValue(mockData);
      VM[
        '_settingItemListHandle'
      ] = new SettingItemFocBuilder().buildSettingItemFoc(1);
      const result = VM.settingItemData;
      expect(result).toEqual({ sortItem: {}, sortSection: [101] });
    });
    it('should return { sortItem: {}, sortSection: [] } when valueType not equal 0 ', () => {
      const VM = new SettingContainerViewModel();
      const mockData = { id: 10, valueType: 1 };
      (getEntity as jest.Mock).mockReturnValue(mockData);
      VM[
        '_settingItemListHandle'
      ] = new SettingItemFocBuilder().buildSettingItemFoc(1);
      const result = VM.settingItemData;
      expect(result).toEqual({ sortItem: {}, sortSection: [] });
    });
    it('should return { sortItem: {[ obj ]}, sortSection: [] } when valueType not equal 0 and has parentModelId', () => {
      const VM = new SettingContainerViewModel();
      const mockData = { id: 10, valueType: 1, parentModelId: 10 };
      (getEntity as jest.Mock).mockReturnValue(mockData);
      VM[
        '_settingItemListHandle'
      ] = new SettingItemFocBuilder().buildSettingItemFoc(1);
      const result = VM.settingItemData;
      expect(result).toEqual({ sortItem: { 10: [mockData] }, sortSection: [] });
    });
  });

  describe('setCurrentTypeScrollHeight()', () => {
    const listStore = SettingContainerViewModel.settingListStore;
    const type = 'general' as SETTING_LIST_TYPE;
    const height = 100;
    const model = new SettingContainerViewModel();

    model.setCurrentTypeScrollHeight(type, height);

    const { height: expectHeight } = listStore.get(type) as listStoreType;
    expect(expectHeight).toEqual(height);
  });
});
