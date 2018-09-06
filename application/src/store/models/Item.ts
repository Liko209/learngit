import { Item } from 'sdk/models';
import Base from './Base';
export default class ItemModel extends Base<Item> {
  constructor(data: Item) {
    super(data);
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
