/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import ItemAPI from '../../api/glip/item';
import ItemDao from '../../dao/item';
import { ENTITY } from '../../service/eventKey';
import UploadManager from '../../service/UploadManager';
import { versionHash } from '../../utils/mathUtils';
import { transform, baseHandleData } from '../utils';
import { ISendFile } from '../../service/item';
import { StoredFile, Item, Raw, FileItem } from '../../models';

const itemHandleData = async (items: Raw<Item>[]) => {
  if (items.length === 0) {
    return;
  }
  const transformedData = items.map(item => transform<Item>(item));
  const itemDao = daoManager.getDao(ItemDao);
  // handle deactivated data and normal data
  return baseHandleData({
    data: transformedData,
    dao: itemDao,
    eventKey: ENTITY.ITEM,
  });
};

const uploadStorageFile = async (params: ISendFile): Promise<StoredFile> => {
  const { file, groupId } = params;
  const result = await ItemAPI.uploadFileItem(file, (e: ProgressEventInit) => {
    const { loaded, total } = e;
    if (loaded && total) {
      const percent = loaded / total;
      UploadManager.emit(String(groupId), (percent * 100).toFixed(0));
    }
  });
  const storedFile = result.expect('Failed to upload file item.');
  return storedFile;
};

const extractFileNameAndType = (storagePath: string) => {
  const options = {
    name: '',
    type: '',
  };
  if (storagePath) {
    const arr = storagePath.split('/');
    if (arr && arr.length > 0) {
      const name = arr[arr.length - 1];
      options.name = name;

      const seArr = name.split('.');
      options.type = seArr[seArr.length - 1];
    }
  }
  return options;
};

export type Options = {
  storedFile: StoredFile;
  groupId?: string;
};

const sendFileItem = async (options: Options): Promise<Raw<FileItem>> => {
  const nameType = extractFileNameAndType(options.storedFile.storage_path);
  const version = versionHash();
  const fileVersion = {
    stored_file_id: options.storedFile._id, // eslint-disable-line
    url: options.storedFile.storage_url,
    download_url: options.storedFile.download_url,
    date: options.storedFile.last_modified,
    size: options.storedFile.size,
    creator_id: Number(options.storedFile.creator_id),
  };
  const fileItemOptions = {
    version,
    creator_id: Number(options.storedFile.creator_id),
    new_version: version,
    name: nameType.name,
    type: nameType.type,
    source: 'upload',
    no_post: true,
    group_ids: [Number(options.groupId)],
    post_ids: [],
    versions: [fileVersion],
    created_at: Date.now(),
    is_new: true,
  };
  const result = await ItemAPI.sendFileItem(fileItemOptions);
  const rawFileItem = result.expect('Failed to send file item.');
  return rawFileItem;
};

export { uploadStorageFile, extractFileNameAndType, sendFileItem };
export default itemHandleData;
