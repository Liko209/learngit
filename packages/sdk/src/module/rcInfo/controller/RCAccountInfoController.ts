/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-27 16:20:44
 * Copyright © RingCentral. All rights reserved.
 */

import { CompanyService } from '../../company';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { RCInfoFetchController } from './RCInfoFetchController';
import { RC_BRAND_ID_TO_TYPES, RC_BRAND_NAME_TO_BRAND_ID } from './constants';
import { RCBrandType } from '../types';

class RCAccountInfoController {
  constructor(private _rcInfoFetchController: RCInfoFetchController) {}

  getBrandID2Type(brandId: string): Promise<RCBrandType> {
    const type = brandId.length && RC_BRAND_ID_TO_TYPES[brandId];
    return type !== undefined ? type : RCBrandType.OTHER;
  }

  async getAccountBrandId(): Promise<string | undefined> {
    const accountInfo = await this._getAccountInfo();
    if (
      accountInfo &&
      accountInfo.serviceInfo &&
      accountInfo.serviceInfo.brand &&
      accountInfo.serviceInfo.brand.id
    ) {
      return accountInfo.serviceInfo.brand.id;
    }

    const companyService = ServiceLoader.getInstance<CompanyService>(
      ServiceConfig.COMPANY_SERVICE,
    );
    const brandName = await companyService.getBrandType();
    return brandName && RC_BRAND_NAME_TO_BRAND_ID[brandName];
  }

  async getOutboundCallPrefix() {
    const accountInfo = await this._getAccountInfo();
    const prefix = (accountInfo && accountInfo.outboundCallPrefix) || 0;
    return prefix >= 2 && prefix <= 9 ? prefix.toString() : '\0';
  }

  async getAccountMainNumber() {
    const accountInfo = await this._getAccountInfo();
    return accountInfo && accountInfo.mainNumber;
  }

  async getHomeCountry() {
    const accountInfo = await this._getAccountInfo();
    return (
      accountInfo &&
      accountInfo.serviceInfo &&
      accountInfo.serviceInfo.brand &&
      accountInfo.serviceInfo.brand.homeCountry
    );
  }

  private async _getAccountInfo() {
    return this._rcInfoFetchController.getRCAccountInfo();
  }
}

export { RCAccountInfoController };
