/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 09:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';

class ItemService extends EntityBaseService<Item> {
  constructor() {
    super();
  }
}

export { ItemService };
