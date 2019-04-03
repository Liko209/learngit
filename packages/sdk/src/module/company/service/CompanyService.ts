/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-22 13:16:14
 * Copyright © RingCentral. All rights reserved.
 */

import { CompanyController } from '../controller/CompanyController';
import { CompanyDao } from '../dao/CompanyDao';
import { Company } from '../entity';
import { SOCKET } from '../../../service/eventKey';
import { EntityBaseService } from '../../../framework';
import { daoManager } from '../../../dao';
import Api from '../../../api/api';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { Raw } from '../../../framework/model';
import { SYNC_SOURCE } from '../../../module/sync/types';

class CompanyService extends EntityBaseService<Company> {
  static serviceName = 'CompanyService';
  private _companyController: CompanyController;

  constructor() {
    super(true, daoManager.getDao(CompanyDao), {
      basePath: '/company',
      networkClient: Api.glipNetworkClient,
    });

    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.COMPANY]: this.handleIncomingData.bind(this),
      }),
    );
  }

  async getCompanyEmailDomain(id: number): Promise<string | null> {
    return await this.getCompanyController().getCompanyEmailDomain(id);
  }

  async handleIncomingData(companies: Raw<Company>[], source: SYNC_SOURCE) {
    await this.getCompanyController().handleCompanyData(companies, source);
  }

  protected getCompanyController() {
    if (!this._companyController) {
      this._companyController = new CompanyController(this.getEntitySource());
    }
    return this._companyController;
  }
}

export { CompanyService };
