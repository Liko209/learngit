/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-14 20:26:21
 * Copyright © RingCentral. All rights reserved.
 */
import { NETWORK_METHOD, NETWORK_VIA, Result } from 'foundation';
import { GlipTypeUtil, TypeDictionary } from '../../utils/glip-type-dictionary';
import Api from '../api';
import { IdModel, Raw } from '../../framework/model';

import { ItemFile, Item, StoredFile, NoteItem } from '../../module/item/entity';

import { RequestHolder } from '../requestHolder';
import {
  AmazonFilePolicyRequestModel,
  AmazonFileUploadPolicyData,
} from './types';

interface IRightRailItemModel extends IdModel {
  items: Raw<Item>[];
}

type ProgressCallback = (e: ProgressEventInit) => any;
type UploadFileResult = Result<StoredFile>;
type FileResult = Result<Raw<ItemFile>>;

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
  static sendFileItem(data: object) {
    return this.glipNetworkClient.post<Raw<ItemFile>>('/file', data);
  }

  static requestAmazonFilePolicy(fileInfo: AmazonFilePolicyRequestModel) {
    return this.glipNetworkClient.post<AmazonFileUploadPolicyData>(
      '/s3/v1/post-policy',
      fileInfo,
    );
  }

  static uploadFileToAmazonS3(
    host: string,
    formFile: FormData,
    callback: ProgressCallback,
    requestHolder?: RequestHolder,
  ) {
    return this.customNetworkClient(host).http<string>(
      {
        path: '',
        method: NETWORK_METHOD.POST,
        via: NETWORK_VIA.HTTP,
        data: formFile,
        requestConfig: {
          onUploadProgress(event: ProgressEventInit): void {
            if (callback) {
              callback(event);
            }
          },
        },
      },
      requestHolder,
    );
  }

  static uploadFileItem(
    files: FormData,
    callback: ProgressCallback,
    requestHolder?: RequestHolder,
  ) {
    return this.uploadNetworkClient.http<StoredFile>(
      {
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
      },
      requestHolder,
    );
  }

  static cancelUploadRequest(requestHolder: RequestHolder) {
    if (requestHolder && requestHolder.request) {
      this.uploadNetworkClient.cancelRequest(requestHolder.request);
    }
  }

  static requestById(id: number) {
    return this.glipNetworkClient.get<Raw<ItemFile>>(getItemServerUrl(id));
  }

  static requestRightRailItems(groupId: number) {
    return this.glipNetworkClient.get<IRightRailItemModel>(
      '/web_client_right_rail_items',
      {
        group_id: groupId,
      },
    );
  }

  static getNote(id: number) {
    return this.glipNetworkClient.get<Raw<NoteItem>>(`/pages_body/${id}`);
  }

  static putItem<T>(id: number, type: string, data: Partial<T>) {
    return this.glipNetworkClient.put<Raw<T>>(`/${type}/${id}`, data);
  }
}

export default ItemAPI;
export {
  IRightRailItemModel,
  FileResult,
  ProgressCallback,
  UploadFileResult,
  RequestHolder,
};
