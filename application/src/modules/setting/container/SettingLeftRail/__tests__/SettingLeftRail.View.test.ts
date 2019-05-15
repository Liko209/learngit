/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { getGlobalValue } from '@/store/utils';
import { SettingLeftRailViewModel } from '../SettingLeftRail.ViewModel';
import { SETTING_LIST_TYPE, SettingLeftRailProps } from '../types';

jest.mock('@/store/utils');

describe('SettingLeftRailViewModel', () => {
  describe('currentSettingListType()', () => {
    it('should equal mockData when currentSettingListType', () => {
      const VM = new SettingLeftRailViewModel();
      const mockData = 'phone';
      (getGlobalValue as jest.Mock).mockReturnValue(mockData);
      const result = VM.currentSettingListType;
      expect(result).toEqual(mockData);
    });
    it('should equal SETTING_LIST_TYPE.GENERAL when getGlobalValue return null', () => {
      const VM = new SettingLeftRailViewModel();
      const mockData = '';
      (getGlobalValue as jest.Mock).mockReturnValue(mockData);
      const result = VM.currentSettingListType;
      expect(result).toEqual(SETTING_LIST_TYPE.GENERAL);
    });
  });
  describe('onReceiveProps()', () => {
    it('should return SETTING_LIST_TYPE.GENERAL when call onReceiveProps with SETTING_LIST_TYPE.GENERAL', () => {
      const VM = new SettingLeftRailViewModel();
      const mockData = {
        type: SETTING_LIST_TYPE.GENERAL,
      } as SettingLeftRailProps;
      VM.onReceiveProps(mockData);
      expect(VM['_type']).toEqual(SETTING_LIST_TYPE.GENERAL);
    });
    it('should return undefined when call onReceiveProps not with in SETTING_LIST_TYPE.GENERAL', () => {
      const VM = new SettingLeftRailViewModel();
      const mockData = { type: 'none' } as SettingLeftRailProps;
      VM.onReceiveProps(mockData);
      expect(VM['_type']).toEqual(undefined);
    });
  });
});
