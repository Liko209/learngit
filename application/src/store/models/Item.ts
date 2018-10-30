import { Item } from 'sdk/models';
import { observable } from 'mobx';
import Base from './Base';

export default class ItemModel extends Base<Item> {
  @observable summary: string;
  @observable title: string;
  @observable url: string;
  @observable image: string;
  @observable deactivated: boolean;
  constructor(data: Item) {
    super(data);
    this.summary = data.summary;
    this.title = data.title;
    this.url = data.url;
    this.image = data.image;
    this.deactivated = data.deactivated;
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
