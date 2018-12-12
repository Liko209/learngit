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
import { ItemService, SENDING_STATUS } from 'sdk/service';
import StoreViewModel from '@/store/ViewModel';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';
import { FILE_FORM_DATA_KEYS } from 'sdk/service/item';

class AttachmentsViewModel extends StoreViewModel<AttachmentsProps>
  implements AttachmentsViewProps {
  private _itemService: ItemService;
  @observable
  items: Map<string, AttachmentItem> = new Map<string, AttachmentItem>();
  @observable
  selectedFiles: SelectFile[] = [];

  constructor(props: AttachmentsProps) {
    super(props);
    this._itemService = ItemService.getInstance();
  }

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get files() {
    const values: AttachmentItem[] = Array.from(this.items.values());
    return values.map(({ data }) => ({ file: data } as ItemInfo));
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
      const { data, duplicate } = info;
      const form = new FormData();
      form.append(FILE_FORM_DATA_KEYS.FILE_NAME, data.name);
      form.append(FILE_FORM_DATA_KEYS.FILE, data);
      const item = await this._itemService.sendItemFile(
        this.props.id,
        form,
        isUpdate,
      );
      if (item) {
        if (duplicate) {
          const record = this.items.get(data.name);
          if (record) {
            record.item = item;
            record.data = data;
            record.status = SENDING_STATUS.INPROGRESS;
          }
        } else {
          this.items.set(data.name, {
            item,
            data,
            status: SENDING_STATUS.INPROGRESS,
          } as AttachmentItem);
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
    const { file } = info;
    const record = this.items[file.name];
    if (record) {
      try {
        await this._itemService.cancelUpload(record.item.id);
        this.items.delete(file.name);
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
}

export { AttachmentsViewModel };
