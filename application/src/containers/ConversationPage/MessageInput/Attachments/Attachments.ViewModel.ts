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
import { ItemService, PostService, SENDING_STATUS } from 'sdk/service';
import StoreViewModel from '@/store/ViewModel';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';
import { FILE_FORM_DATA_KEYS } from 'sdk/service/item';
import { ItemFile } from 'sdk/src/models';

class AttachmentsViewModel extends StoreViewModel<AttachmentsProps>
  implements AttachmentsViewProps {
  private _itemService: ItemService;
  private _postService: PostService;
  @observable
  items: Map<string, AttachmentItem> = new Map<string, AttachmentItem>();
  @observable
  selectedFiles: SelectFile[] = [];

  constructor(props: AttachmentsProps) {
    super(props);
    this._itemService = ItemService.getInstance();
    this._postService = PostService.getInstance();
    this.reaction(
      () => this.id,
      (id: number) => {
        this.reloadFiles();
      },
    );
  }

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get files() {
    const values: AttachmentItem[] = Array.from(this.items.values());
    return values.map(({ item }) => ({ name: item.name } as ItemInfo));
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
    const result: ItemFile[] = this._itemService.getUploadItems(this.id);
    if (result && result.length > 0) {
      result.forEach((element: ItemFile) => {
        this.items.set(element.name, {
          item: element,
          status: element.sendStatus,
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
        this.items.set(data.name, {
          item,
          data,
          status: SENDING_STATUS.INPROGRESS,
        } as AttachmentItem);
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
    const { name } = info;
    const record = this.items.get(name);
    if (record) {
      try {
        await this._itemService.cancelUpload(record.item.id);
        this.items.delete(name);
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

  sendFilesOnlyPost = async () => {
    try {
      const values: AttachmentItem[] = Array.from(this.items.values());
      const ids = values.map(({ item }) => item.id);
      await this._postService.sendPost({
        text: '',
        groupId: this.id,
        itemIds: ids,
      });
      this.items.clear();
    } catch (e) {}
  }
}

export { AttachmentsViewModel };
