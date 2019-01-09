/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 13:20:57
 * Copyright © RingCentral. All rights reserved.
 */

import { Post } from '../../post/entity';
import { Item, ItemFile } from '../entity';
import { Progress, PROGRESS_STATUS } from '../../progress/entity';

interface IItemService {
  getItems(
    typeId: number,
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): Promise<Item[]>;

  handleSanitizedItems(items: Item[]): void;

  createItem(item: Item): Promise<void>;

  updateItem(item: Item): Promise<void>;

  deleteItem(itemId: number): Promise<void>;

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

  getRightRailItemsOfGroup(groupId: number, limit?: number): Promise<Item[]>;

  doNotRenderItem(id: number, type: string): Promise<void>;

  getGroupItemsCount(groupId: number, typeId: number): Promise<number>;
}
export { IItemService };
