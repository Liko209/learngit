/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 10:24:06
 * Copyright © RingCentral. All rights reserved.
 */

import { IntegrationItemController } from '../controller/IntegrationItemController';
import { IntegrationItem } from '../entity';
import { GlipTypeUtil } from '../../../../../utils';
import { EntityBaseService } from '../../../../../framework/service';
class IntegrationItemService extends EntityBaseService<IntegrationItem> {
  private _integrationItemController: IntegrationItemController;

  constructor() {
    super(false);
    this.setCheckTypeFunc((id: number) => {
      return GlipTypeUtil.isIntegrationType(id);
    });
  }

  protected get integrationItemController() {
    if (!this._integrationItemController) {
      this._integrationItemController = new IntegrationItemController();
    }
    return this._integrationItemController;
  }
}

export { IntegrationItemService };
