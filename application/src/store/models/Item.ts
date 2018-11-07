import { Item } from 'sdk/models';
import { observable } from 'mobx';
import { TypeDictionary } from 'sdk/utils';
import { setFileData } from './Items';
import Base from './Base';

const ITEM_DATA_HANDLE_MAP = {
  [TypeDictionary.TYPE_ID_TASK]: () => {},
  [TypeDictionary.TYPE_ID_FILE]: setFileData,
  [TypeDictionary.TYPE_ID_EVENT]: () => {},
  [TypeDictionary.TYPE_ID_LINK]: () => {},
};

export default class ItemModel extends Base<Item> {
  @observable
  typeId: number;
  @observable
  summary: string;
  @observable
  title: string;
  @observable
  url: string;
  @observable
  image: string;
  @observable
  deactivated: boolean;

  constructor(data: Item) {
    super(data);
    const { type_id } = data;
    this.data = data;
    this.summary = data.summary;
    this.title = data.title;
    this.url = data.url;
    this.image = data.image;
    this.deactivated = data.deactivated;
    this.typeId = type_id;

    ITEM_DATA_HANDLE_MAP[type_id] && ITEM_DATA_HANDLE_MAP[type_id].call(this);
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
