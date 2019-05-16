/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-09 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { DialingCountryInfo } from 'sdk/api';
import { JuiRegionSelectProps } from 'jui/components/Selects';

type RegionSettingItemViewProps = {
  description: string | JSX.Element;
  onChange: Function;
  value: any;
  state: number; // change
  canUseRegionSetting: boolean;
  currentCountryInfo: DialingCountryInfo;
  countriesList: CountriesListType;
  loadRegionSetting: () => void;
  hasAreaCode: () => boolean;
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

type RegionSettingItemProps = {};

export {
  RegionSettingItemViewProps,
  RegionSettingItemProps,
  CountriesListType,
};
