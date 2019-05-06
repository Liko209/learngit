import { RCInfoFetchController } from './RCInfoFetchController';
import { IPhoneNumberRecord } from '../../../api/ringcentral/types/common';
import { PhoneNumberType } from '../types';

class RCCallerIdController {
  constructor(private _rcInfoFetchController: RCInfoFetchController) {}

  async getCallerIdList() {
    let {
      records = [],
    } = await this._rcInfoFetchController.getExtensionPhoneNumberList();
    if (!records.length) {
      const rcAccountInfo = await this._rcInfoFetchController.getRCAccountInfo();
      records = this._addDefaultNumber(records, {
        usageType: PhoneNumberType[PhoneNumberType.MainCompanyNumber],
        phoneNumber: rcAccountInfo && rcAccountInfo.mainNumber,
      });
    }
    records = this._addDefaultNumber(records, {
      usageType: PhoneNumberType[PhoneNumberType.Blocked],
      phoneNumber: PhoneNumberType[PhoneNumberType.Blocked],
    });
    return records.sort(this._recordsSortFn);
  }
  private _addDefaultNumber(
    callerIdList: IPhoneNumberRecord[],
    defaultNumber: { usageType: string; phoneNumber: any },
  ) {
    callerIdList.push(defaultNumber as IPhoneNumberRecord);
    return callerIdList;
  }

  private _recordsSortFn(a: IPhoneNumberRecord, b: IPhoneNumberRecord) {
    let typeOfA = PhoneNumberType[a.usageType];
    let typeOfB = PhoneNumberType[b.usageType];
    if (typeOfA === PhoneNumberType.CompanyNumber && a.label) {
      typeOfA = PhoneNumberType.NickName;
    }
    if (typeOfB === PhoneNumberType.CompanyNumber && b.label) {
      typeOfB = PhoneNumberType.NickName;
    }
    return typeOfA - typeOfB;
  }
}
export { RCCallerIdController };
