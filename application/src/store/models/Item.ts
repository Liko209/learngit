import { Item, ItemVersions } from 'sdk/models';
import { observable } from 'mobx';

import Base from './Base';
export default class ItemModel extends Base<Item> {
  @observable
  data: any;
  @observable
  type: Item['type'];
  @observable
  typeId: Item['type_id'];
  @observable
  url: ItemVersions['url'];
  @observable
  downloadUrl: ItemVersions['download_url'];
  @observable
  size: ItemVersions['size'];
  @observable
  name: Item['name'];
  @observable
  pages: ItemVersions['pages'];

  constructor(data: Item) {
    super(data);
    const { type, type_id, name, versions } = data;
    this.type = type;
    this.typeId = type_id;
    this.name = name;
    this.data = data;
    if (versions && versions.length > 0) {
      const version = versions[0];
      const { url, download_url, size, pages } = version;
      this.url = url;
      this.size = size;
      this.downloadUrl = download_url;
      if (pages && pages.length > 0) {
        this.pages = pages;
      }
    }
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
