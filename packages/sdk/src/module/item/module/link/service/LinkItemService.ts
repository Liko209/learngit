/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:59
 * Copyright © RingCentral. All rights reserved.
 */

import { SubItemService } from '../../base/service/SubItemService';
import { LinkItemController } from '../controller/LinkItemController';

class LinkItemService extends SubItemService {
  private _linkItemController: LinkItemController;
  constructor() {
    super();
  }

  protected get linkItemController() {
    if (!this._linkItemController) {
      this._linkItemController = new LinkItemController();
    }
    return this._linkItemController;
  }
}

export { LinkItemService };
