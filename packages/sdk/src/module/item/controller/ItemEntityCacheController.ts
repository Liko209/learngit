/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-29 15:50:09
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityCacheController } from 'sdk/framework/controller/impl/EntityCacheController';
import { Item } from '../entity';

class ItemEntityCacheController extends EntityCacheController<Item> {

  private _typeIdMap: Map<number, number[]> = new Map();

  static buildItemEntityCacheController(sizeForType: number) {
    return new ItemEntityCacheController(sizeForType);
  }

  constructor(private sizeForType: number) {
    super();
  }

  async clear(): Promise<void> {
    super.clear();
    this._typeIdMap.clear();
  }

  protected putInternal(item: Item) {
    super.putInternal(item);
    const ids = this._typeIdMap.get(item.type_id);
    if (ids) {
      if (ids.length >= this.sizeForType) {
        const id = ids.shift();
        id && super.delete(id);
      }
      ids.push(item.id);
    }
    else {
      const values = item.id ? [item.id] : [];
      this._typeIdMap.set(item.type_id, values);
    }
  }
}

export { ItemEntityCacheController }
