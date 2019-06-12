/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-10 13:32:59
 * Copyright © RingCentral. All rights reserved.
 */
import { RCInfoFetchController } from './RCInfoFetchController';
import { AccountService } from 'sdk/module/account';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';

const CALLER_ID_ORDER = {
  [PhoneNumberType.DirectNumber]: 0,
  [PhoneNumberType.MainCompanyNumber]: 1,
  [PhoneNumberType.Blocked]: 2,
  [PhoneNumberType.NickName]: 3,
  [PhoneNumberType.CompanyNumber]: 4,
  [PhoneNumberType.AdditionalCompanyNumber]: 5,
  [PhoneNumberType.CompanyFaxNumber]: 6,
};
const CALLER_ID_LABEL = {
  [PhoneNumberType.DirectNumber]: 'Direct Number',
  [PhoneNumberType.MainCompanyNumber]: 'Main Company Number',
  [PhoneNumberType.Blocked]: 'Blocked',
  [PhoneNumberType.CompanyNumber]: 'Company Number',
  [PhoneNumberType.AdditionalCompanyNumber]: 'Company Number',
  [PhoneNumberType.CompanyFaxNumber]: 'Company Fax Number',
};
const CALLER_ID_FILTER_TYPE = [
  PhoneNumberType.ForwardedNumber,
  PhoneNumberType.ForwardedCompanyNumber,
  PhoneNumberType.ContactCenterNumber,
  PhoneNumberType.ConferencingNumber,
];

const BLOCKED_NUMBER_CALLER_ID = 0;

class RCCallerIdController {
  constructor(private _rcInfoFetchController: RCInfoFetchController) {}

  async getCallerIdList() {
    let result: PhoneNumberModel[] = [];
    const { records = [] } =
      (await this._rcInfoFetchController.getExtensionPhoneNumberList()) || {};
    if (!records.length) {
      result = await this._getNumberFromUserInfo();
    } else {
      result = records;
    }
    return this._handleCallerIdList(result);
  }
  private _handleCallerIdList(callerIdList: PhoneNumberModel[]) {
    let result = [];
    result = this._addBlockedNumber(callerIdList);
    result = result.filter(
      (item) =>
        !CALLER_ID_FILTER_TYPE.includes(item.usageType as PhoneNumberType),
    );
    result = result.map((item) => {
      const { id, phoneNumber, usageType, label } = item;
      return {
        id,
        phoneNumber,
        usageType:
          label && usageType === PhoneNumberType.CompanyNumber
            ? PhoneNumberType.NickName
            : usageType,
        label: label ? label : CALLER_ID_LABEL[usageType],
      };
    });
    result.sort(this._recordsSortFn.bind(this));
    return result;
  }

  async getCallerById(id: number) {
    const callerIds = await this.getCallerIdList();
    const index = callerIds.findIndex((caller) => caller.id === id);
    return index !== -1 ? callerIds[index] : undefined;
  }

  async getFirstDidCaller() {
    const callerIds = await this.getCallerIdList();
    for (const callerId of callerIds) {
      if (callerId && callerId.usageType === PhoneNumberType.DirectNumber) {
        return callerId;
      }
    }
    return undefined;
  }

  async getCompanyMainCaller() {
    const callers = await this.getCallerIdList();
    for (const callerId of callers) {
      if (
        callerId &&
        callerId.usageType === PhoneNumberType.MainCompanyNumber
      ) {
        return callerId;
      }
    }
    return undefined;
  }

  private _addBlockedNumber(callerIdList: PhoneNumberModel[]) {
    return [
      ...callerIdList,
      {
        id: BLOCKED_NUMBER_CALLER_ID,
        usageType: PhoneNumberType.Blocked,
        phoneNumber: PhoneNumberType.Blocked,
      },
    ];
  }
  private async _getNumberFromUserInfo() {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    const { rc_phone_numbers = [] } =
      (await accountService.getCurrentUserInfo()) || {};
    return rc_phone_numbers;
  }

  private _recordsSortFn(a: PhoneNumberModel, b: PhoneNumberModel) {
    return this._getSortValue(a) - this._getSortValue(b);
  }

  private _getSortValue(item: PhoneNumberModel): number {
    let value = CALLER_ID_ORDER[item.usageType] as number;
    if (item.label && item.usageType === PhoneNumberType.CompanyNumber) {
      value = CALLER_ID_ORDER[PhoneNumberType.NickName];
    }
    return value;
  }
}
export { RCCallerIdController };
