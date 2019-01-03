/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 09:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { ItemServiceController } from '../controller/ItemServiceController';

class ItemService extends EntityBaseService<Item> {
  private _itemServiceController: ItemServiceController;
  constructor() {
    super();
  }

  protected get itemServiceController() {
    if (!this._itemServiceController) {
      this._itemServiceController = new ItemServiceController();
    }
    return this._itemServiceController;
  }
}

export { ItemService };
