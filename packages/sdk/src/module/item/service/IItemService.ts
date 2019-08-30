/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 13:20:57
 * Copyright © RingCentral. All rights reserved.
 */

import { Post } from '../../post/entity';
import { Item, ItemFile, ConferenceItem } from '../entity';
import { Progress, PROGRESS_STATUS } from '../../progress/entity';
import { ItemQueryOptions, ItemFilterFunction } from '../types';
import { Raw } from '../../../framework/model';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { ChangeModel } from 'sdk/module/sync/types';

interface IItemService {
  getEntitySource(): IEntitySourceController<Item>;

  getItems(options: ItemQueryOptions): Promise<Item[]>;

  sendItemFile(
    groupId: number,
    file: File,
    isUpdate: boolean,
  ): Promise<ItemFile | null>;

  deleteFileItemCache(id: number): void;

  sendItemData(groupId: number, itemIds: number[]): Promise<void>;

  getItemVersion(itemFile: ItemFile): Promise<number>;

  cancelUpload(itemId: number): Promise<void>;

  getUploadItems(groupId: number): ItemFile[];

  canResendFailedItems(itemIds: number[]): Promise<boolean>;

  resendFailedItems(itemIds: number[]): Promise<void>;

  isFileExists(groupId: number, fileName: string): Promise<boolean>;

  canUploadFiles(
    groupId: number,
    newFiles: File[],
    includeUnSendFiles: boolean,
  ): boolean;

  getUploadProgress(itemId: number): Progress | undefined;

  getItemsSendingStatus(itemIds: number[]): PROGRESS_STATUS[];

  cleanUploadingFiles(groupId: number, itemIds: number[]): void;

  getByPosts(posts: Post[]): Promise<Item[]>;

  doNotRenderItem(id: number, type: string): Promise<void>;

  cancelZoomMeeting(id: number): Promise<void>;

  getGroupItemsCount(
    groupId: number,
    typeId: number,
    filterFunc?: ItemFilterFunction,
  ): Promise<number>;

  getItemDataHandler(): (items: Raw<Item>[]) => void;

  requestSyncGroupItems(groupId: number): Promise<void>;

  getThumbsUrlWithSize(itemId: number): Promise<string>;

  getThumbsUrlWithSize(
    itemId: number,
    width: number,
    height: number,
  ): Promise<string>;

  hasUploadingFiles(): boolean;

  getItemIndexInfo(
    itemId: number,
    options: ItemQueryOptions,
  ): Promise<{ index: number; totalCount: number }>;

  editFileName(itemId: number, newName: string): Promise<void>;

  startConference(groupId: number): Promise<ConferenceItem>;

  handleIncomingData(
    items: Raw<Item>[],
    changeMap?: Map<string, ChangeModel>,
  ): Promise<any>;
}
export { IItemService };
