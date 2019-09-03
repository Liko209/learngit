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
import { notificationCenter, EVENT_TYPES } from 'sdk/service';
import { mainLogger } from 'foundation/log';
import { GroupConfigService } from 'sdk/module/groupConfig';
import { ItemService, ItemNotification } from 'sdk/module/item';
import { PostService } from 'sdk/module/post';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import StoreViewModel from '@/store/ViewModel';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';
import { ItemFile } from 'sdk/module/item/entity';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { analyticsCollector } from '@/AnalyticsCollector';
import { Group } from 'sdk/module/group';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { SHORT_CUT_KEYS } from '@/AnalyticsCollector/constants';

const QUILL_QUERY = '.conversation-page>div>div>.quill>.ql-container';
class AttachmentsViewModel extends StoreViewModel<AttachmentsProps>
  implements AttachmentsViewProps {
  private _didUploadFileCallback?: DidUploadFileCallback;
  @observable
  items: Map<number, AttachmentItem> = new Map<number, AttachmentItem>();
  @observable
  selectedFiles: SelectFile[] = [];

  constructor(props: AttachmentsProps) {
    super(props);
    this.reaction(
      () => this.props.id,
      () => {
        this.reloadFiles();
      },
    );

    this.reaction(
      () => this.files,
      () => {
        const getQuill = document.querySelector(QUILL_QUERY) as any;
        const quill = getQuill && getQuill.__quill;
        requestAnimationFrame(() => {
          quill.focus();
        });
      },
    );

    notificationCenter.on(
      ItemNotification.getItemNotificationKey(),
      this._handleItemChanged,
    );
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
        if (record && record.item.group_ids.includes(this.props.id)) {
          this.items.delete(looper);
          const newItem: ItemFile = entities.get(looper);
          this.items.set(newItem.id, {
            item: newItem,
            data: record.data,
          } as AttachmentItem);
        }
      });
    }
  };

  @computed
  get canPost() {
    const group = getEntity<Group, GroupModel>(
      ENTITY_NAME.GROUP,
      this.props.id,
    );
    return group.canPost;
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

  reloadFiles = async () => {
    this.cleanFiles();
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const uploadItems = await itemService.initialUploadItemsFromDraft(
      this.props.id,
    );
    if (uploadItems && uploadItems.length > 0) {
      uploadItems.forEach((element: ItemFile) => {
        this.items.set(element.id, {
          item: element,
        } as AttachmentItem);
      });
    }
  };

  autoUploadFiles = async (
    files: File[],
    checkDuplicate: boolean = true,
    callback?: DidUploadFileCallback,
  ) => {
    const canUpload = await this.canUploadFiles(files);
    if (!canUpload) {
      Notification.flashToast({
        message:
          'item.prompt.uploadFailedMessageThereIsAlreadyAFileBeingUploaded',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
        autoHideDuration: 3000,
      });
      return;
    }
    if (files.length > 0) {
      let hasDuplicate = false;
      let exists: boolean[] = [];
      if (checkDuplicate) {
        exists = await Promise.all(files.map(file => this.isFileExists(file)));
        hasDuplicate = exists.some(value => value);
      }
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
  };

  canUploadFiles = async (files: File[]) => {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    if (files.length === 0) {
      return true;
    }
    return itemService.canUploadFiles(this.props.id, files, true); // TODO: The third parameter should be false for drag and drop files.
  };

  private _uploadFiles = async (files: SelectFile[], isUpdate: boolean) => {
    return Promise.all(files.map(file => this.uploadFile(file, isUpdate)));
  };

  uploadFile = async (info: SelectFile, isUpdate: boolean) => {
    try {
      const { data } = info;
      const itemService = ServiceLoader.getInstance<ItemService>(
        ServiceConfig.ITEM_SERVICE,
      );
      const item = await itemService.sendItemFile(
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
        if (this.props.forceSaveDraft) {
          this.forceSaveDraftItems();
        }
      }
      return item;
    } catch (e) {
      return null;
    }
  };

  isFileExists = async (file: File) => {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    return await itemService.isFileExists(this.props.id, file.name);
  };

  cancelUploadFile = async (info: ItemInfo) => {
    const { id } = info;
    const record = this.items.get(id);
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    if (record) {
      await itemService.cancelUpload(id);
      this.items.delete(id);
      this.forceSaveDraftItems();
    }
  };

  onEscTrackedCancelDuplicateFiles = () => {
    this.cancelDuplicateFiles();
    analyticsCollector.shortcuts(SHORT_CUT_KEYS.ESCAPE);
  }

  private _clearUpSelectedFiles = () => {
    this.selectedFiles = [];
  };

  cancelDuplicateFiles = () => {
    this._clearUpSelectedFiles();
  };

  // as new files
  uploadDuplicateFiles = async () => {
    await this._uploadFiles(this.selectedFiles, false);
    this._clearUpSelectedFiles();
    if (this._didUploadFileCallback) {
      await this._didUploadFileCallback();
    }
    this._didUploadFileCallback = undefined;
  };

  updateDuplicateFiles = async () => {
    await this._uploadFiles(this.selectedFiles, true);
    this._clearUpSelectedFiles();
    if (this._didUploadFileCallback) {
      await this._didUploadFileCallback();
    }
    this._didUploadFileCallback = undefined;
  };

  cleanFiles = () => {
    this.items.clear();
  };

  sendFilesOnlyPost = async () => {
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    try {
      const ids: number[] = [];
      this.items.forEach((value: AttachmentItem) => {
        ids.push(value.item.id);
      });
      await postService.sendPost({
        text: '',
        groupId: this.props.id,
        itemIds: ids,
      });
      this.items.clear();
      this._trackSendPost();
    } catch (e) {
      mainLogger.error(e)
    }
  };

  private _trackSendPost() {
    const group = getEntity<Group, GroupModel>(
      ENTITY_NAME.GROUP,
      this.props.id,
    );
    analyticsCollector.sendPost(
      'drag',
      'conversation thread',
      'file',
      group.analysisType,
    );
  }

  forceSaveDraftItems = () => {
    const draftItemsIds: number[] = [];
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    this.files.forEach((file: ItemFile) => {
      draftItemsIds.push(file.id);
    });
    groupConfigService.updateDraft({
      attachment_item_ids: draftItemsIds,
      id: this.props.id,
    });
  };

  dispose = () => {
    notificationCenter.off(
      ItemNotification.getItemNotificationKey(),
      this._handleItemChanged,
    );
  };
}

export { AttachmentsViewModel };
