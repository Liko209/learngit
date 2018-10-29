import { Item } from 'sdk/models';
import { observable } from 'mobx';

import Base from './Base';
export default class ItemModel extends Base<Item> {
  @observable
  type: string;
  @observable
  typeId: number;
  @observable
  url: string;
  @observable
  downloadUrl: string;
  @observable
  size: number;
  @observable
  name: string;
  @observable
  isDocument: boolean;
  @observable
  isNew: boolean;
  @observable
  pages: {
    file_id: number;
    url: string;
  }[];
  @observable
  thumbs: any;
  @observable
  origHeight: number;
  @observable
  origWidth: number;

  constructor(data: Item) {
    super(data);
    const { type_id } = data;
    this.typeId = type_id;
    this.setFileData();
  }

  setFileData() {
    const { type, name, versions, is_document, is_new } = this.data;
    this.type = type;
    this.name = name;
    this.isDocument = is_document;
    this.isNew = is_new;
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
