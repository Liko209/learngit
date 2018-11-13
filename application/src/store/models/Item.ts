import { Item } from 'sdk/models';
import { observable } from 'mobx';
import { TypeDictionary } from 'sdk/utils';
import { FileItem, ExtendFileItem, FileType } from '@/store/models/Items';
import { setFileData, setLinkData, setEventData, setTaskData } from './Items';
import Base from './Base';

const ITEM_DATA_HANDLE_MAP = {
  [TypeDictionary.TYPE_ID_TASK]: setTaskData,
  [TypeDictionary.TYPE_ID_FILE]: setFileData,
  [TypeDictionary.TYPE_ID_EVENT]: setEventData,
  [TypeDictionary.TYPE_ID_LINK]: setLinkData,
  [TypeDictionary.TYPE_ID_PAGE]: setNoteData,
};

const FILE_ICON_MAP = {
  pdf: ['pdf'],
  sheet: ['xlsx', 'xls'],
  ppt: ['ppt', 'pptx', 'potx'],
  ps: ['ps', 'psd'],
};

export default class ItemModel extends Base<Item> {
  @observable
  typeId: number;

  constructor(data: Item) {
    super(data);
    const { type_id } = data;
    this.typeId = type_id;

    ITEM_DATA_HANDLE_MAP[type_id] &&
      ITEM_DATA_HANDLE_MAP[type_id].call(this, data);
  }

  getFileIcon(fileType: string) {
    for (const key in FILE_ICON_MAP) {
      if (FILE_ICON_MAP[key].includes(fileType)) {
        return key;
      }
    }
    return null;
  }

  getFileType(this: FileItem): ExtendFileItem {
    const fileType: ExtendFileItem = {
      item: this,
      type: -1,
      previewUrl: '',
    };

    if (this.image().isImage) {
      fileType.type = FileType.image;
      fileType.previewUrl = this.image().previewUrl;
      return fileType;
    }

    if (this.document().isDocument) {
      fileType.type = FileType.document;
      fileType.previewUrl = this.document().previewUrl;
      return fileType;
    }

    fileType.type = FileType.others;
    return fileType;
  }

  image(this: FileItem) {
    const thumbs = this.thumbs;
    const type = this.thumbs;
    const url = this.thumbs;
    const image = {
      isImage: false,
      previewUrl: '',
    };

    if (type === 'gif') {
      image.isImage = true;
      image.previewUrl = url;
      return image;
    }

    if (thumbs) {
      for (const key in thumbs) {
        const value = thumbs[key];
        if (typeof value === 'string' && value.indexOf('http') > -1) {
          image.isImage = true;
          image.previewUrl = thumbs[key];
        }
      }
    }
    return image;
  }

  document(this: FileItem) {
    const pages = this.pages;
    const doc = {
      isDocument: false,
      previewUrl: '',
    };
    if (pages && pages.length > 0) {
      doc.isDocument = true;
      doc.previewUrl = pages[0].url;
    }
    return doc;
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
