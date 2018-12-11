/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:13
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import {
  AttachmentsProps,
  AttachmentsViewProps,
  AttachmentsObserverFunc,
} from './types';
import { ItemService } from 'sdk/service';
import StoreViewModel from '@/store/ViewModel';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';
import { FILE_FORM_DATA_KEYS } from 'sdk/service/item';
import { ItemFile } from 'sdk/models';

class AttachmentsViewModel extends StoreViewModel<AttachmentsProps>
  implements AttachmentsViewProps {
  private _itemService: ItemService;
  private _attachmentsObserver: AttachmentsObserverFunc;
  @observable
  items: ItemFile[] = [];
  @observable
  files: ItemInfo[] = [];
  @observable
  duplicateFiles: ItemInfo[] = [];
  @observable
  uniqueFiles: ItemInfo[] = [];

  constructor(props: AttachmentsProps) {
    super(props);
    this._itemService = ItemService.getInstance();
    this._attachmentsObserver = props.attachmentsObserver;
    this.reaction(
      () => this.items,
      () => this._attachmentsObserver(this.items),
    );
  }

  @computed
  get id() {
    return this.props.id;
  }

  autoUploadFiles = async (files: File[]) => {
    if (files.length > 0) {
      const uniques: ItemInfo[] = [];
      const duplicateFiles: ItemInfo[] = [];
      const exists = await Promise.all(
        files.map(file => this.isFileExists(file)),
      );

      for (let i = 0; i < exists.length; ++i) {
        if (exists[i]) {
          duplicateFiles.push({ file: files[i], status: 'normal' });
        } else {
          uniques.push({ file: files[i], status: 'normal' });
        }
      }

      this.uniqueFiles = uniques;
      if (duplicateFiles.length > 0) {
        this.duplicateFiles = duplicateFiles;
      } else {
        await this._uploadFiles(uniques, false);
        this.files = this.files.concat(uniques);
        this._clearUpSelectedFiles();
      }
    }
  }

  private _uploadFiles = async (files: ItemInfo[], isUpdate: boolean) => {
    return Promise.all(files.map(file => this.uploadFile(file, isUpdate)));
  }

  uploadFile = async (info: ItemInfo, isUpdate: boolean) => {
    try {
      const { file } = info;
      const form = new FormData();
      form.append(FILE_FORM_DATA_KEYS.FILE_NAME, file.name);
      form.append(FILE_FORM_DATA_KEYS.FILE, file);
      const item = await this._itemService.sendItemFile(
        this.props.id,
        form,
        isUpdate,
      );
      if (item) {
        this.items = this.items.concat(item);
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
    const items = this.items;
    const files = this.files;
    const index = files.findIndex(looper => looper.file === file);
    if (index >= 0) {
      try {
        const item = items[index];
        await this._itemService.cancelUpload(item.id);
        items.splice(index);
        this.items = items.slice(0);
      } catch (e) {}
      files.splice(index, 1);
      this.files = files.slice(0);
    }
  }

  private _clearUpSelectedFiles = () => {
    this.duplicateFiles = [];
    this.uniqueFiles = [];
  }

  cancelDuplicateFiles = () => {
    this._clearUpSelectedFiles();
  }

  // as new files
  uploadDuplicateFiles = async () => {
    await this._uploadFiles(this.duplicateFiles, false);
    await this._uploadFiles(this.uniqueFiles, false);
    // finally, update files
    this.files = this.files
      .concat(this.duplicateFiles)
      .concat(this.uniqueFiles);
    this._clearUpSelectedFiles();
  }

  updateDuplicateFiles = async () => {
    await this._uploadFiles(this.duplicateFiles, true);
    await this._uploadFiles(this.uniqueFiles, false);
    // finally, update files
    this.files = this.files.concat(this.uniqueFiles);
    this._clearUpSelectedFiles();
  }
}

export { AttachmentsViewModel };
