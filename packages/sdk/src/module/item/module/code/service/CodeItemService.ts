/*
 * @Author: Paynter Chen
 * @Date: 2019-01-14 17:52:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';
import { IItemService } from '../../../service/IItemService';
import { ItemQueryOptions } from '../../../types';
import { CodeItem } from '../entity';

class CodeItemService extends EntityBaseService<CodeItem>
  implements ISubItemService {
  constructor(itemService: IItemService) {
    super();
  }

  async updateItem(file: CodeItem) {}

  async deleteItem(itemId: number) {}

  async createItem(file: CodeItem) {}

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    return [];
  }

  async getSubItemsCount(groupId: number) {
    return 0;
  }
}

export { CodeItemService };
