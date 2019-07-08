/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-22 13:18:58
 * Copyright © RingCentral. All rights reserved.
 */

import { Company, CompanyServiceParameter, E_ACCOUNT_TYPE } from '../entity';
import { Raw } from '../../../framework/model';
import { transform } from '../../../service/utils';
import { shouldEmitNotification } from '../../../utils/notificationUtils';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { ENTITY } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';
import { SYNC_SOURCE, ChangeModel } from '../../sync/types';
import { AccountService } from '../../account/service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';

class CompanyController {
  private _currentCompanyId: number;
  constructor(
    public entitySourceController: IEntitySourceController<Company>,
  ) {}

  async getBrandType() {
    const company = await this.entitySourceController.get(
      this._currentCompanyId,
    );
    return (company && company.rc_brand) || undefined;
  }

  private _getCurrentCompanyId() {
    const config = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return config.getCurrentCompanyId();
  }

  async getUserAccountTypeFromSP430(): Promise<E_ACCOUNT_TYPE | undefined> {
    const companyId = this._getCurrentCompanyId();
    if (!companyId) {
      return undefined;
    }
    const company = await this.entitySourceController.get(companyId);
    if (company) {
      const serviceParameters = company.rc_service_parameters;
      if (serviceParameters) {
        const infoIndex = serviceParameters.findIndex(
          (value: CompanyServiceParameter) => {
            return value.id === 430; // 430 means tier edition
          },
        );
        if (infoIndex !== -1) {
          return serviceParameters[infoIndex].value;
        }
      }
    }

    return undefined;
  }

  async isUserCompanyTelephonyOn() {
    const company = await this.entitySourceController.get(
      this._currentCompanyId,
    );

    return company ? !!company.allow_rc_feature_rcphone : false;
  }

  async getCompanyEmailDomain(id: number): Promise<string | null> {
    const company = await this.entitySourceController.get(id);
    let result = '';
    if (company) {
      if (company.webmail_person_id && company.webmail_person_id > 0) {
        result = company.id.toString();
      } else {
        const domains = company.domain;
        result = Array.isArray(domains) ? domains[0] : domains;
      }
    }
    return result;
  }

  private async _getTransformData(
    companies: Raw<Company>[],
  ): Promise<Company[]> {
    const transformedData: (Company | null)[] = await Promise.all(
      companies.map(async (item: Raw<Company>) => {
        const { _delta: delta, _id: id } = item;
        const finalItem = item;
        if (delta && id) {
          const requestController = this.entitySourceController.getRequestController();
          if (requestController) {
            return await requestController.get(id);
          }
        }
        return transform<Company>(finalItem);
      }),
    );
    return transformedData.filter(
      (item: Company | null) => item !== null,
    ) as Company[];
  }

  async handleCompanyData(
    companies: Raw<Company>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    if (companies.length === 0) {
      return;
    }
    const transformedData: Company[] = await this._getTransformData(companies);
    if (shouldEmitNotification(source)) {
      if (changeMap) {
        changeMap.set(ENTITY.COMPANY, { entities: transformedData });
      } else {
        notificationCenter.emitEntityUpdate(ENTITY.COMPANY, transformedData);
      }
    }
    await this.entitySourceController.bulkPut(transformedData);
  }
}

export { CompanyController };
