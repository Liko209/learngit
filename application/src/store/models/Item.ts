import { Item } from 'sdk/models';
import { observable } from 'mobx';
import { TypeDictionary } from 'sdk/utils';
import { setFileData, setLinkData, setNoteData, setEventData } from './Items';
import Base from './Base';

const ITEM_DATA_HANDLE_MAP = {
  [TypeDictionary.TYPE_ID_TASK]: () => { },
  [TypeDictionary.TYPE_ID_FILE]: setFileData,
  [TypeDictionary.TYPE_ID_EVENT]: setEventData,
  [TypeDictionary.TYPE_ID_LINK]: setLinkData,
  [TypeDictionary.TYPE_ID_PAGE]: setNoteData,
};

export default class ItemModel extends Base<Item> {
  @observable
  typeId: number;

  constructor(data: Item) {
    super(data);
    const { type_id } = data;
    this.typeId = type_id;

    ITEM_DATA_HANDLE_MAP[type_id] && ITEM_DATA_HANDLE_MAP[type_id].call(this, data);
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
