/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-09 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { computed, observable, action } from 'mobx';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { RCInfoService } from 'sdk/module/rcInfo';
import { DialingCountryInfo } from 'sdk/api';
import { StoreViewModel } from '@/store/ViewModel';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import i18nT from '@/utils/i18nT';
import { JuiIconographyProps } from 'jui/foundation/Iconography';
import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils/entities';
import { ENTITY_NAME } from '@/store/constants';
import SettingModel from '@/store/models/UserSetting';
import {
  RegionSettingItemProps,
  CountriesListType,
  RegionSettingItemViewProps,
} from './types';

const AVOID_AREA_CODE_BEGIN_NUM = '0';
const AREA_CODE_ALLOW_LEN = 3;

class RegionSettingItemViewModel extends StoreViewModel<RegionSettingItemProps>
  implements RegionSettingItemViewProps {
  @observable
  dialPlanISOCode: string = '';
  @observable
  areaCode: string = '';
  @observable
  areaCodeError: boolean = false;
  @observable
  errorMsg: string = '';
  @observable
  renderAreaCode: boolean = false;
  @observable
  disabledOkBtn: boolean = false;

  @observable
  private _countriesList: CountriesListType = [];

  @observable
  private _currentCountryInfo: DialingCountryInfo = {
    id: '',
    name: '',
    isoCode: '',
    callingCode: '',
  };

  @computed
  get settingItemEntity() {
    return getEntity<UserSettingEntity, SettingModel>(
      ENTITY_NAME.USER_SETTING,
      this.props.id,
    );
  }

  rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );

  private _getCountryFlag: (
    isoCode: DialingCountryInfo['isoCode'],
  ) => JuiIconographyProps['symbol'] = isoCode => undefined

  private _currentCountryAreaCode: string = '';

  private _loadCountryFlag = async () => {
    const res = await import(/*
      webpackChunkName: "m.country-flag" */ './countryFlagLoader');
    return res.getCountryFlag;
  }

  @action
  loadRegionSetting = async () => {
    this._getCountryFlag = await this._loadCountryFlag();
    this._currentCountryInfo = await this.getCurrentCountry();
    this._countriesList = await this.getCountriesList();

    if (this._currentCountryInfo) {
      this.dialPlanISOCode = this._currentCountryInfo.isoCode;
    }

    const hasAreaCode = this.rcInfoService.hasAreaCode(
      this.currentCountryInfo.callingCode,
    );
    if (hasAreaCode) {
      this.areaCode = await this.rcInfoService.getAreaCode();
      this._currentCountryAreaCode = this.areaCode;
      this.renderAreaCode = true;
    }
    this.disabledOkBtn = true;
  }

  @computed
  get currentCountryAreaCode() {
    return this._currentCountryAreaCode;
  }

  @computed
  get currentCountryInfo() {
    return this._currentCountryInfo;
  }

  @computed
  get countriesList() {
    return this._countriesList;
  }

  @action
  getCurrentCountry = async () => {
    this._currentCountryInfo = await this.rcInfoService.getCurrentCountry();
    return this._currentCountryInfo;
  }

  @action
  getCountriesList = async () => {
    const countiesList = await this.rcInfoService.getCountryList();
    this._countriesList = this._transformCountriesList(countiesList);
    return this._countriesList;
  }

  private _transformCountriesList = (countryList: DialingCountryInfo[]) => {
    return countryList.map(country => {
      const { id, name, isoCode, callingCode } = country;
      return {
        id,
        label: name,
        value: isoCode,
        regionCode: callingCode,
        regionIcon: this._getCountryFlag(isoCode),
      };
    });
  }

  private _getCallingCodeByDialPlanISOCode(
    isoCode: DialingCountryInfo['isoCode'],
  ): DialingCountryInfo['callingCode'] {
    const country = this._countriesList.find(
      country => country.value === isoCode,
    );
    return !!country ? country.regionCode || '' : '';
  }

  @action
  private _updateAreaCode(isoCode: DialingCountryInfo['isoCode']) {
    if (isoCode === this._currentCountryInfo.isoCode) {
      this.areaCode = this._currentCountryAreaCode;
      this.disabledOkBtn = true;
    } else {
      this.areaCode = '';
      this.disabledOkBtn = false;
    }

    this.errorMsg = '';
    this.areaCodeError = false;
  }

  @action
  handleDialPlanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dialPlanISOCode = e.target.value.trim();
    this.dialPlanISOCode = dialPlanISOCode;
    const callingCode = this._getCallingCodeByDialPlanISOCode(dialPlanISOCode);
    this.renderAreaCode = !!this.rcInfoService.hasAreaCode(callingCode);
    this._updateAreaCode(dialPlanISOCode);
  }

  @action
  handleAreaCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const areaCode = e.target.value.trim();
    this.areaCode = areaCode;
    // reset
    this.errorMsg = '';
    this.areaCodeError = false;
    this.disabledOkBtn = false;

    if (this._currentCountryAreaCode === areaCode) {
      this.disabledOkBtn = true;
    }
    // check
    if (
      _.isNaN(Number(areaCode)) ||
      areaCode[0] === AVOID_AREA_CODE_BEGIN_NUM ||
      areaCode.length > AREA_CODE_ALLOW_LEN ||
      !this.rcInfoService.isAreaCodeValid(this.areaCode)
    ) {
      this._handleAreaCodeError();
    }
  }

  @action
  saveRegion = async (
    dialPlanISOCode: string,
    areaCode: string,
  ): Promise<boolean> => {
    try {
      await this.rcInfoService.setDefaultCountry(dialPlanISOCode);

      const isAreaCodeValid = await this.rcInfoService.isAreaCodeValid(
        areaCode,
      );

      if (isAreaCodeValid || areaCode === '') {
        await this.rcInfoService.setAreaCode(areaCode);
      } else {
        this._handleAreaCodeError();
        return false;
      }

      this.disabledOkBtn = true;

      const saveSuccessText = await i18nT(
        'setting.phone.general.regionSetting.saveSuccessText',
      );

      Notification.flashToast({
        message: saveSuccessText,
        type: ToastType.SUCCESS,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });

      return true;
    } catch {
      return false;
    }
  }

  private _handleAreaCodeError = async () => {
    this.areaCodeError = true;
    this.disabledOkBtn = true;
    this.errorMsg = await i18nT(
      'setting.phone.general.regionSetting.areaCodeErrorText',
    );
  }
}

export { RegionSettingItemViewModel };
