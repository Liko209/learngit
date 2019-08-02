/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-10 13:32:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RCInfoFetchController } from './RCInfoFetchController';
import { AccountService } from 'sdk/module/account';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import {
  IExtensionCallerFeatureRequest,
  IExtensionCallerId,
  IExtensionCallerFeature,
} from 'sdk/api/ringcentral/types/common';
import { RCInfoApi } from 'sdk/api';
import { CALLER_ID_FEATURE_NAME } from '../config/constants';
import { RC_INFO } from 'sdk/service';
import { PartialModifyController } from 'sdk/framework/controller/impl/PartialModifyController';
import { IPartialModifyController } from 'sdk/framework/controller/interface/IPartialModifyController';
import { IPartialEntitySourceController } from 'sdk/framework/controller/interface/IPartialEntitySourceController';

const CALLER_ID_ORDER = {
  [PhoneNumberType.DirectNumber]: 0,
  [PhoneNumberType.MainCompanyNumber]: 1,
  [PhoneNumberType.Blocked]: 2,
  [PhoneNumberType.NickName]: 3,
  [PhoneNumberType.CompanyFaxNumber]: 4,
  [PhoneNumberType.CompanyNumber]: 5,
  [PhoneNumberType.AdditionalCompanyNumber]: 6,
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
  private _partialModifyController: IPartialModifyController<
    IExtensionCallerId,
    string
  >;
  constructor(private _rcInfoFetchController: RCInfoFetchController) {
    this._initPartialController();
  }
  private _initPartialController() {
    const entitySourceController: IPartialEntitySourceController<
      IExtensionCallerId,
      string
    > = {
      getEntityNotificationKey: () => RC_INFO.EXTENSION_CALLER_ID,
      get: async () => await this._rcInfoFetchController.getExtensionCallerId(),
      update: async (item: IExtensionCallerId) => {
        await this._rcInfoFetchController.setExtensionCallerId(item);
      },
    };
    this._partialModifyController = new PartialModifyController(
      entitySourceController,
    );
  }

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
      (item: PhoneNumberModel) =>
        !CALLER_ID_FILTER_TYPE.includes(item.usageType as PhoneNumberType),
    );
    result = result.map((item: PhoneNumberModel) => {
      const { id, phoneNumber, usageType, label } = item;
      return {
        id,
        phoneNumber,
        usageType: label ? PhoneNumberType.NickName : usageType,
        label: label || CALLER_ID_LABEL[usageType],
      };
    });
    result.sort(this._recordsSortFn.bind(this));
    return result;
  }

  async getCallerById(id: number) {
    const callerIds = await this.getCallerIdList();
    const index = callerIds.findIndex(caller => caller.id === id);
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
    return CALLER_ID_ORDER[a.usageType] - CALLER_ID_ORDER[b.usageType];
  }
  private _getCallerIdRequest(callerId: number) {
    const params: IExtensionCallerFeatureRequest = {
      feature: CALLER_ID_FEATURE_NAME,
      callerId: {},
    };
    if (callerId === BLOCKED_NUMBER_CALLER_ID) {
      params.callerId = {
        type: PhoneNumberType.Blocked,
      };
    } else {
      params.callerId = {
        phoneInfo: { id: callerId.toString() },
      };
    }
    return params;
  }

  async setDefaultCallerId(callerId: number) {
    const params = this._getCallerIdRequest(callerId);
    const preHandlePartial = (
      partialModel: Partial<IExtensionCallerId>,
      originalModel: IExtensionCallerId,
    ): Partial<IExtensionCallerId> => {
      let newData = _.cloneDeep(originalModel.byFeature);
      newData = newData.map(item => {
        if (item.feature === CALLER_ID_FEATURE_NAME) {
          return params as IExtensionCallerFeature;
        }
        return item;
      });
      partialModel.byFeature = newData;
      return partialModel;
    };
    await this._partialModifyController.updatePartially({
      entityId: RC_INFO.EXTENSION_CALLER_ID,
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async () =>
        await RCInfoApi.setExtensionCallerId({
          byFeature: [params],
        }),
    });
  }

  async getExtensionCallerId() {
    const response = await this._rcInfoFetchController.getExtensionCallerId();
    if (response) {
      const callerInfo = response.byFeature.find(
        item => item.feature === CALLER_ID_FEATURE_NAME,
      );
      if (callerInfo) {
        if (_.get(callerInfo, 'callerId.type') === PhoneNumberType.Blocked) {
          return BLOCKED_NUMBER_CALLER_ID;
        }
        const id = _.get(callerInfo, 'callerId.phoneInfo.id');
        return id && _.toNumber(id);
      }
    }
    return null;
  }

  async hasSetCallerId() {
    const result = await this._rcInfoFetchController.getExtensionCallerId();
    return !!result;
  }

  async getDefaultCallerId() {
    const defaultCallerNumberId = await this.getExtensionCallerId();
    return (
      (defaultCallerNumberId !== null &&
        (await this.getCallerById(defaultCallerNumberId))) ||
      ((await this.getFirstDidCaller()) || (await this.getCompanyMainCaller()))
    );
  }
}
export { RCCallerIdController };
