/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-03-27 11:11:43
 * Copyright © RingCentral. All rights reserved.
 */

import { Company } from '../entity';
import { EntityCacheController } from '../../../framework/controller/impl/EntityCacheController';
import { AccountService } from '../../account/service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';

class CompanyEntityCacheController extends EntityCacheController<Company> {
  private _currentUserCompanyId: number;

  static buildCompanyEntityCacheController() {
    return new CompanyEntityCacheController();
  }

  constructor() {
    super();
  }

  async clear(): Promise<void> {
    delete this._currentUserCompanyId;
    super.clear();
  }

  private get _needCachedId() {
    if (!this._currentUserCompanyId) {
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      this._currentUserCompanyId = userConfig.getCurrentCompanyId();
    }
    return this._currentUserCompanyId;
  }

  protected putInternal(company: Company) {
    if (company.id === this._needCachedId) {
      super.putInternal(company);
    }
  }
}

export { CompanyEntityCacheController };
