import { Item } from 'sdk/module/item/entity';
import { BaseStore } from '../BaseStore';

export class ItemStore extends BaseStore<Item> {
  constructor() {
    super('item');
  }

  getItemsByGroupId(id: number) {
    return this.collection.where(value => {
      return value.group_ids.includes(id);
    });
  }

  getItemsByPostId(id: number) {
    return this.collection.where(value => {
      return value.post_ids.includes(id);
    });
  }
}
