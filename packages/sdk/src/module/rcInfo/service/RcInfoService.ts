/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 13:07:35
 * Copyright © RingCentral. All rights reserved.
 */

import { SERVICE } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { RcInfoController } from '../controller/RcInfoController';

class RcInfoService extends EntityBaseService {
  private _rcInfoController: RcInfoController;
  constructor() {
    super(false);
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.FETCH_INDEX_DATA_DONE]: this.requestRcInfo,
      }),
    );
    this.requestRcInfo();
  }

  private get rcInfoController(): RcInfoController {
    if (!this._rcInfoController) {
      this._rcInfoController = new RcInfoController();
    }
    return this._rcInfoController;
  }

  requestRcInfo = async () => {
    await this.rcInfoController.requestRcInfo();
  }
}

export { RcInfoService };
