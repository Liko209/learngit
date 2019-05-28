/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-09 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { DialingCountryInfo } from 'sdk/api';
import { RegionSettingInfo } from 'sdk/module/rcInfo/setting/types';
import { JuiRegionSelectProps } from 'jui/components/Selects';
import SettingModel from '@/store/models/UserSetting';

type RegionSettingItemViewProps = {
  settingItemEntity: SettingModel<RegionSettingInfo>;
  currentCountryInfo: DialingCountryInfo;
  countriesList: CountriesListType;
  loadRegionSetting: () => void;
  dialPlanISOCode: string;
  areaCode: string | undefined;
  areaCodeError: boolean;
  errorMsg: string;
  handleAreaCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDialPlanChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveRegion: (
    dialPlan: string,
    areaCode?: string | undefined,
  ) => Promise<boolean>;
  renderAreaCode: boolean;
  disabledOkBtn: boolean;
};

type CountriesListType = JuiRegionSelectProps['regionList'];

type RegionSettingItemProps = {
  id: number;
};

export {
  RegionSettingItemViewProps,
  RegionSettingItemProps,
  CountriesListType,
};
