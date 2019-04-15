/*
 * @Author: Paynter Chen
 * @Date: 2019-01-14 17:52:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { EntityBaseService } from '../../../../../framework/service';
import { ItemQueryOptions } from '../../../types';
import { CodeItem } from '../entity';
import { GlipTypeUtil, TypeDictionary } from '../../../../../utils';
class CodeItemService extends EntityBaseService<CodeItem>
  implements ISubItemService {
  constructor() {
    super(false);
    this.setCheckTypeFunc((id: number) => {
      return GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_CODE);
    });
  }

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    return [];
  }

  async getSubItemsCount(groupId: number) {
    return 0;
  }
}

export { CodeItemService };
