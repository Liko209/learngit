/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-09 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import { RegionSettingItemViewModel } from '../RegionSettingItem.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
jest.mock('@/utils/i18nT', () => (key: string) => key);
import { Notification } from '@/containers/Notification';

const currentCountryInfo = {
  id: '1',
  name: 'United States',
  isoCode: 'US',
  callingCode: '1',
};
const countryList = [
  { id: '1', name: 'United States', isoCode: 'US', callingCode: '1' },
  { id: '39', name: 'Canada', isoCode: 'CA', callingCode: '1' },
  { id: '53', name: 'Costa Rica', isoCode: 'CR', callingCode: '506' }, // not area code
];
const transformList = [
  {
    id: '1',
    label: 'United States',
    value: 'US',
    regionIcon: 'United States.svg',
    regionCode: '1',
  },
  {
    id: '39',
    label: 'Canada',
    value: 'CA',
    regionIcon: 'Canada.svg',
    regionCode: '1',
  },
  {
    id: '53',
    label: 'Costa Rica',
    value: 'CR',
    regionIcon: 'Costa Rica.svg',
    regionCode: '506',
  },
];
const regionService = {
  getCurrentCountry() {
    return currentCountryInfo;
  },
  getCountryList() {
    return countryList;
  },
  hasAreaCode(callingCode: string) {
    return callingCode === '1';
  },
  isAreaCodeValid(areaCode: string) {
    return areaCode === '800' || areaCode === '970';
  },
  getAreaCode() {
    return '970';
  },
  setDefaultCountry: () => {
    return true;
  },
  setAreaCode: () => {
    return true;
  },
};
ServiceLoader.getInstance = jest.fn().mockReturnValue(regionService);

describe('RegionSettingItemViewModel', () => {
  describe('loadRegionSetting()', () => {});

  describe('getCurrentCountry()', () => {
    it('should get current country info', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();
      const info = await VM.getCurrentCountry();
      expect(info).toEqual(currentCountryInfo);
      expect(VM.currentCountryInfo).toEqual(currentCountryInfo);
      done();
    });
  });
  describe('getCountriesList()', () => {
    it('should get countries list', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();
      const list = await VM.getCountriesList();
      expect(list).toEqual(transformList);
      expect(VM.countriesList).toEqual(transformList);
      done();
    });
  });

  describe('handleDialPlanChange()', () => {
    it('should show areaCode textField when change dialplan has area code', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();

      VM.handleDialPlanChange({
        target: {
          value: 'CA',
        },
      } as React.ChangeEvent<HTMLInputElement>);

      expect(VM.dialPlanISOCode).toEqual('CA');
      expect(VM.renderAreaCode).toBeTruthy();
      expect(VM.areaCodeError).toBeFalsy();
      expect(VM.errorMsg).toEqual('');
      expect(VM.areaCode).toEqual('');
      done();
    });
    it('should not show areaCode textField when change to the dialplan not has area code', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();

      VM.handleDialPlanChange({
        target: {
          value: 'CR',
        },
      } as React.ChangeEvent<HTMLInputElement>);

      expect(VM.dialPlanISOCode).toEqual('CR');
      expect(VM.renderAreaCode).toBeFalsy();
      expect(VM.areaCodeError).toBeFalsy();
      expect(VM.errorMsg).toEqual('');
      expect(VM.areaCode).toEqual('');
      done();
    });
  });

  describe('handleAreaCodeChange()', () => {
    it('should disable the okBtn when area code is not changed', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();

      expect(VM.currentCountryAreaCode).toEqual('970');
      VM.handleAreaCodeChange({
        target: {
          value: '970',
        },
      } as React.ChangeEvent<HTMLInputElement>);

      expect(VM.disabledOkBtn).toBeTruthy();
      done();
    });
    it('should hide the error message and enable the okBtn when enter the right areaCode', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();

      VM.handleAreaCodeChange({
        target: {
          value: '800',
        },
      } as React.ChangeEvent<HTMLInputElement>);

      expect(VM.errorMsg).toEqual('');
      expect(VM.areaCodeError).toBeFalsy();
      expect(VM.disabledOkBtn).toBeFalsy();

      done();
    });
    it('should show inline error when enter the not valid area code', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();

      VM.handleAreaCodeChange({
        target: {
          value: '0',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(VM.areaCodeError).toBeTruthy();

      VM.areaCode = '';
      VM.handleAreaCodeChange({
        target: {
          value: '1234',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(VM.areaCodeError).toBeTruthy();

      VM.areaCode = '';
      VM.handleAreaCodeChange({
        target: {
          value: '3fa',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(VM.areaCodeError).toBeTruthy();
      done();
    });
  });

  describe('saveRegion()', () => {
    it('should return true and show notification when save region successful', async (done: jest.DoneCallback) => {
      Notification.flashToast = jest.fn();

      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();

      const saveState = await VM.saveRegion(VM.dialPlanISOCode, VM.areaCode);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'setting.phone.general.regionSetting.saveSuccessText',
        }),
      );
      expect(VM.disabledOkBtn).toBeTruthy();
      expect(saveState).toEqual(true);
      done();
    });
    it('should return false when save failed', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();

      const saveState = await VM.saveRegion(VM.dialPlanISOCode, '101');
      expect(VM.areaCodeError).toBeTruthy();
      expect(VM.disabledOkBtn).toBeTruthy();
      expect(saveState).toEqual(false);
      done();
    });
    it('JPT-1807: Display error when failed to match the rules of area code', async (done: jest.DoneCallback) => {
      const VM = new RegionSettingItemViewModel();
      await VM.loadRegionSetting();

      const saveState = await VM.saveRegion(VM.dialPlanISOCode, '101');
      expect(VM.areaCodeError).toBeTruthy();
      expect(VM.disabledOkBtn).toBeTruthy();
      expect(VM.errorMsg).toEqual(
        'setting.phone.general.regionSetting.areaCodeErrorText',
      );
      expect(saveState).toEqual(false);
      done();
    });
  });
});
