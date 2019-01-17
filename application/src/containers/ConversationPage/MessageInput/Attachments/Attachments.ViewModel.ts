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
  DidUploadFileCallback,
} from './types';

import {
  PostService,
  notificationCenter,
  ENTITY,
  EVENT_TYPES,
} from 'sdk/service';

import { ItemService } from 'sdk/module/item';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import StoreViewModel from '@/store/ViewModel';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';
import { ItemFile } from 'sdk/module/item/entity';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

const QUILL_QUERY = '.conversation-page>div>div>.quill>.ql-container';
class AttachmentsViewModel extends StoreViewModel<AttachmentsProps>
  implements AttachmentsViewProps {
  private _itemService: ItemService;
  private _postService: PostService;
  private _didUploadFileCallback?: DidUploadFileCallback;
  @observable
  items: Map<number, AttachmentItem> = new Map<number, AttachmentItem>();
  @observable
  selectedFiles: SelectFile[] = [];

  constructor(props: AttachmentsProps) {
    super(props);
    this._itemService = ItemService.getInstance();
    this._postService = PostService.getInstance();
    this.reaction(
      () => this.id,
      () => {
        this.reloadFiles();
      },
    );

    this.reaction(
      () => this.files,
      () => {
        const quill = (document.querySelector(QUILL_QUERY) as any).__quill;
        requestAnimationFrame(() => {
          quill.focus();
        });
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

  autoUploadFiles = async (files: File[], callback?: DidUploadFileCallback) => {
    const canUpload = await this.canUploadFiles(files);
    if (!canUpload) {
      Notification.flashToast({
        message: 'uploadFailedMessageThereIsAlreadyAFileBeingUploaded',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
        autoHideDuration: 3000,
      });
      return;
    }
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
        if (callback) {
          await callback();
        }
      } else {
        this.selectedFiles = result;
        this._didUploadFileCallback = callback;
      }
    }
  }

  canUploadFiles = async (files: File[]) => {
    if (files.length === 0) {
      return true;
    }
    return this._itemService.canUploadFiles(this.id, files, true); // TODO: The third parameter should be false for drag and drop files.
  }

  private _uploadFiles = async (files: SelectFile[], isUpdate: boolean) => {
    return Promise.all(files.map(file => this.uploadFile(file, isUpdate)));
  }

  uploadFile = async (info: SelectFile, isUpdate: boolean) => {
    try {
      const { data } = info;
      const item = await this._itemService.sendItemFile(
        this.props.id,
        data,
        isUpdate,
      );
      if (item) {
        const info: AttachmentItem = {
          item,
          data,
        };
        if (isUpdate) {
          const values: AttachmentItem[] = Array.from(this.items.values());
          const target = values.find(
            looper => looper.item.name === data.name && !looper.item.is_new,
          );
          if (target) {
            this.items.delete(target.item.id);
          }
          this.items.set(item.id, info);
        } else {
          this.items.set(item.id, info);
        }
      }
      return item;
    } catch (e) {
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
      await this._itemService.cancelUpload(id);
      this.items.delete(id);
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
    if (this._didUploadFileCallback) {
      await this._didUploadFileCallback();
    }
    this._didUploadFileCallback = undefined;
  }

  updateDuplicateFiles = async () => {
    await this._uploadFiles(this.selectedFiles, true);
    this._clearUpSelectedFiles();
    if (this._didUploadFileCallback) {
      await this._didUploadFileCallback();
    }
    this._didUploadFileCallback = undefined;
  }

  cleanFiles = () => {
    this.items.clear();
  }

  sendFilesOnlyPost = async () => {
    try {
      const ids: number[] = [];
      this.items.forEach((value: AttachmentItem) => {
        ids.push(value.item.id);
      });
      await this._postService.sendPost({
        text: '',
        groupId: this.id,
        itemIds: ids,
      });
      this.items.clear();
    } catch (e) {}
  }

  dispose = () => {
    notificationCenter.off(ENTITY.ITEM, this._handleItemChanged);
  }
}

export { AttachmentsViewModel };
