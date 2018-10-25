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
  isDocument: Item['is_document'];
  @observable
  isNew: Item['is_new'];
  @observable
  pages: ItemVersions['pages'];
  @observable
  thumbs: any;
  @observable
  origHeight: number;
  @observable
  origWidth: number;

  constructor(data: Item) {
    super(data);
    const { type, type_id, name, versions, is_document, is_new } = data;
    this.type = type;
    this.typeId = type_id;
    this.name = name;
    this.isDocument = is_document;
    this.isNew = is_new;
    this.data = data;
    if (versions && versions.length > 0) {
      const version = versions[0];
      const {
        url,
        download_url,
        size,
        pages,
        thumbs,
        orig_height,
        orig_width,
      } = version;
      this.url = url;
      this.size = size;
      this.downloadUrl = download_url;
      if (pages && pages.length > 0) {
        this.pages = pages;
      }
      if (thumbs) {
        this.thumbs = thumbs;
      }
      if (orig_height) {
        this.origHeight = orig_height;
      }
      if (orig_width) {
        this.origWidth = orig_width;
      }
    }
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
