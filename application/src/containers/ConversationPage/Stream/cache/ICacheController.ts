/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-07 08:32:58
 * Copyright © RingCentral. All rights reserved.
 */

import { FetchSortableDataListHandler } from '@/store/base';
import { IdModel } from 'sdk/framework/model';

interface ICacheController<T extends IdModel> {
  has(groupId: number): boolean;
  get(groupId: number, jump2PostId?: number): FetchSortableDataListHandler<T>;
}

export { ICacheController };
