/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-14 20:26:21
 * Copyright © RingCentral. All rights reserved.
 */
import { IResponse } from '../NetworkClient';
import { GlipTypeUtil, TypeDictionary } from '../../utils/glip-type-dictionary';
import Api from '../api';
import { FileItem, Item, BaseModel, StoredFile, Raw, NoteItem } from '../../models';
import { NETWORK_METHOD, NETWORK_VIA } from 'foundation';

export interface RightRailItemModel extends BaseModel {
  items: Raw<Item>[];
}

const ITEMPATH = {
  [TypeDictionary.TYPE_ID_TASK]: 'task',
  [TypeDictionary.TYPE_ID_EVENT]: 'event',
  [TypeDictionary.TYPE_ID_PAGE]: 'page',
  [TypeDictionary.TYPE_ID_LINK]: 'link',
  [TypeDictionary.TYPE_ID_FILE]: 'file',
  [TypeDictionary.TYPE_ID_MEETING]: 'item',
  // [TypeDictionary.TYPE_ID_RC_VIDEO]: 'item',
  // [TypeDictionary.TYPE_ID_RC_SMS]: 'rc_sms',
  [TypeDictionary.TYPE_ID_RC_VOICEMAIL]: 'rc_voicemail',
};

function getItemServerUrl(id: number): string {
  let url = '/';
  const typeId = GlipTypeUtil.extractTypeId(id);
  if (typeId > TypeDictionary.TYPE_ID_CUSTOM_ITEM) {
    url = '/integration_item';
  } else {
    const path = ITEMPATH[typeId];
    url += path || 'item';
  }
  return `${url}/${id}`;
}

class ItemAPI extends Api {
  static basePath = '/item';
  static sendFileItem(data: object): Promise<IResponse<Raw<FileItem>>> {
    return this.glipNetworkClient.post('/file', data);
  }
  static uploadFileItem(files: FormData, callback?: (e: ProgressEventInit) => any): Promise<IResponse<StoredFile>> {
    return this.uploadNetworkClient.http({
      path: '/upload',
      method: NETWORK_METHOD.POST,
      via: NETWORK_VIA.HTTP,
      data: files,
      requestConfig: {
        onUploadProgress(event: ProgressEventInit): void {
          if (callback) {
            callback(event);
          }
        },
      },
    });
  }
  static requestById(id: number): Promise<IResponse<Raw<FileItem>>> {
    return this.glipNetworkClient.get(getItemServerUrl(id));
  }
  static requestRightRailItems(groupId: number): Promise<IResponse<RightRailItemModel>> {
    return this.glipNetworkClient.get('/web_client_right_rail_items', {
      group_id: groupId,
    });
  }
  static getNote(id: number): Promise<IResponse<Raw<NoteItem>>> {
    return this.glipNetworkClient.get(`/pages_body/${id}`);
  }
}

export default ItemAPI;
