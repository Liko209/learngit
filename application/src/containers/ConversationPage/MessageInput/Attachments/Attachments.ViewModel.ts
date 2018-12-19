/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:13
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import {
  AttachmentsProps,
  AttachmentsViewProps,
  AttachmentItem,
  SelectFile,
} from './types';
import {
  ItemService,
  notificationCenter,
  ENTITY,
  EVENT_TYPES,
} from 'sdk/service';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import StoreViewModel from '@/store/ViewModel';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';
import { FILE_FORM_DATA_KEYS } from 'sdk/service/item';
import { ItemFile } from 'sdk/models';

class AttachmentsViewModel extends StoreViewModel<AttachmentsProps>
  implements AttachmentsViewProps {
  private _itemService: ItemService;
  @observable
  items: Map<number, AttachmentItem> = new Map<number, AttachmentItem>();
  @observable
  selectedFiles: SelectFile[] = [];

  constructor(props: AttachmentsProps) {
    super(props);
    this._itemService = ItemService.getInstance();
    this.reaction(
      () => this.id,
      (id: number) => {
        this.reloadFiles();
      },
    );

    notificationCenter.on(ENTITY.ITEM, this._handleItemChanged);
  }

  private _handleItemChanged = (
    payload: NotificationEntityPayload<ItemFile>,
  ) => {
    const { type } = payload;
    if (type === EVENT_TYPES.REPLACE) {
      const data: any = payload;
      const { ids, entities } = data.body;
      ids.forEach((looper: number) => {
        const record = this.items.get(looper);
        if (record && record.item.group_ids.includes(this.id)) {
          this.items.delete(looper);
          const newItem: ItemFile = entities.get(looper);
          this.items.set(newItem.id, {
            item: newItem,
            data: record.data,
          } as AttachmentItem);
        }
      });
    }
  }

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get files() {
    const values: AttachmentItem[] = Array.from(this.items.values());
    return values.map(
      ({ item }) => ({ name: item.name, id: item.id } as ItemInfo),
    );
  }

  @computed
  get showDuplicateFiles() {
    return this.selectedFiles.some(({ duplicate }) => duplicate);
  }

  @computed
  get duplicateFiles() {
    return this.selectedFiles
      .filter(({ duplicate }) => duplicate)
      .map((looper: SelectFile) => looper.data);
  }

  reloadFiles = () => {
    this.items.clear();
    const result: ItemFile[] = this._itemService.getUploadItems(this.id);
    if (result && result.length > 0) {
      result.forEach((element: ItemFile) => {
        this.items.set(element.id, {
          item: element,
        } as AttachmentItem);
      });
    } else {
      this.cleanFiles();
    }
  }

  autoUploadFiles = async (files: File[]) => {
    if (files.length > 0) {
      const exists = await Promise.all(
        files.map(file => this.isFileExists(file)),
      );
      const hasDuplicate = exists.some(value => value);
      const result = files.map(
        (file, i: number) =>
          ({ data: file, duplicate: exists[i] } as SelectFile),
      );

      if (!hasDuplicate) {
        await this._uploadFiles(result, false);
      } else {
        this.selectedFiles = result;
      }
    }
  }

  private _uploadFiles = async (files: SelectFile[], isUpdate: boolean) => {
    return Promise.all(files.map(file => this.uploadFile(file, isUpdate)));
  }

  uploadFile = async (info: SelectFile, isUpdate: boolean) => {
    try {
      const { data } = info;
      const form = new FormData();
      form.append(FILE_FORM_DATA_KEYS.FILE_NAME, data.name);
      form.append(FILE_FORM_DATA_KEYS.FILE, data);
      const item = await this._itemService.sendItemFile(
        this.props.id,
        form,
        isUpdate,
      );
      if (item) {
        const info: AttachmentItem = {
          item,
          data,
        };
        if (isUpdate) {
          const values: AttachmentItem[] = Array.from(this.items.values());
          const target = values.find(looper => looper.item.name === data.name);
          if (target) {
            this.items.delete(target.item.id);
            this.items.set(item.id, info);
          }
        } else {
          this.items.set(item.id, info);
        }
      }
      return item;
    } catch (e) {
      // TODO
      return null;
    }
  }

  isFileExists = async (file: File) => {
    return await this._itemService.isFileExists(this.props.id, file.name);
  }

  cancelUploadFile = async (info: ItemInfo) => {
    const { id } = info;
    const record = this.items.get(id);
    if (record) {
      try {
        await this._itemService.cancelUpload(id);
        this.items.delete(id);
      } catch (e) {}
    }
  }

  private _clearUpSelectedFiles = () => {
    this.selectedFiles = [];
  }

  cancelDuplicateFiles = () => {
    this._clearUpSelectedFiles();
  }

  // as new files
  uploadDuplicateFiles = async () => {
    await this._uploadFiles(this.selectedFiles, false);
    this._clearUpSelectedFiles();
  }

  updateDuplicateFiles = async () => {
    await this._uploadFiles(this.selectedFiles, true);
    this._clearUpSelectedFiles();
  }

  cleanFiles = () => {
    this.items.clear();
  }

  dispose = () => {
    notificationCenter.off(ENTITY.ITEM, this._handleItemChanged);
  }
}

export { AttachmentsViewModel };
