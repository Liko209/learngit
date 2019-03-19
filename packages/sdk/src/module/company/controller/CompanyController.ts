/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-22 13:18:58
 * Copyright © RingCentral. All rights reserved.
 */

import { Company } from '../entity';
import { Raw } from '../../../framework/model';
import { transform } from '../../../service/utils';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { ENTITY } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';
import { SYNC_SOURCE } from '../../sync/types';
import { ControllerUtils } from '../../../framework/controller/ControllerUtils';

class CompanyController {
  constructor(
    public entitySourceController: IEntitySourceController<Company>,
  ) {}

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

  async handleCompanyData(companies: Raw<Company>[], source: SYNC_SOURCE) {
    if (companies.length === 0) {
      return;
    }
    const transformedData: Company[] = await this._getTransformData(companies);
    if (ControllerUtils.shouldEmitNotification(source)) {
      notificationCenter.emitEntityUpdate(ENTITY.COMPANY, transformedData);
    }
    await this.entitySourceController.bulkUpdate(transformedData);
  }
}

export { CompanyController };
