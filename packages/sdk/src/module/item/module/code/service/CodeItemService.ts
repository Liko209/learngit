/*
 * @Author: Paynter Chen
 * @Date: 2019-01-14 17:52:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';
import { ItemQueryOptions } from '../../../types';
import { CodeItem } from '../entity';

class CodeItemService extends EntityBaseService<CodeItem>
  implements ISubItemService {
  constructor() {
    super(false);
  }

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    return [];
  }

  async getSubItemsCount(groupId: number) {
    return 0;
  }
}

export { CodeItemService };
