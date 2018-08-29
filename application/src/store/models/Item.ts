import { Item } from 'sdk/models';
import { IEntity } from '../store';
export default class ItemModel implements IEntity {
  id: number;
  constructor(data: Item) {
    this.id = data.id;
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }

  dispose() { }
}
