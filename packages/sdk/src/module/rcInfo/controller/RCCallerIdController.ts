import { RCInfoFetchController } from './RCInfoFetchController';
import { IPhoneNumberRecord } from '../../../api/ringcentral/types/common';
import { PhoneNumberType } from 'sdk/module/phoneNumber/types';

const CALLER_ID_ORDER = {
  [PhoneNumberType.DirectNumber]: 0,
  [PhoneNumberType.MainCompanyNumber]: 1,
  [PhoneNumberType.Blocked]: 2,
  [PhoneNumberType.NickName]: 3,
  [PhoneNumberType.CompanyNumber]: 4,
  [PhoneNumberType.CompanyFaxNumber]: 5,
};

class RCCallerIdController {
  constructor(private _rcInfoFetchController: RCInfoFetchController) {}

  async getCallerIdList() {
    let { records = [] } =
      (await this._rcInfoFetchController.getExtensionPhoneNumberList()) || {};
    if (!records.length) {
      const rcAccountInfo = await this._rcInfoFetchController.getRCAccountInfo();
      records = this._addDefaultNumber(records, {
        usageType: PhoneNumberType.MainCompanyNumber,
        phoneNumber: rcAccountInfo && rcAccountInfo.mainNumber,
      });
    }
    records = this._addDefaultNumber(records, {
      usageType: PhoneNumberType.Blocked,
      phoneNumber: PhoneNumberType.Blocked,
    });
    return records.sort(this._recordsSortFn.bind(this));
  }

  private _addDefaultNumber(
    callerIdList: IPhoneNumberRecord[],
    defaultNumber: { usageType: string; phoneNumber: any },
  ) {
    callerIdList.push(defaultNumber as IPhoneNumberRecord);
    return callerIdList;
  }

  private _recordsSortFn(a: IPhoneNumberRecord, b: IPhoneNumberRecord) {
    return this._getSortValue(a) - this._getSortValue(b);
  }

  private _getSortValue(item: IPhoneNumberRecord): number {
    let value = CALLER_ID_ORDER[item.usageType] as number;
    if (item.label && item.usageType === PhoneNumberType.CompanyNumber) {
      value = CALLER_ID_ORDER[PhoneNumberType.NickName];
    }
    return value;
  }
}
export { RCCallerIdController };
