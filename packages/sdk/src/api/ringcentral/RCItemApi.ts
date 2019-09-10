/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-21 13:36:58
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../api';
import {
  NETWORK_VIA,
  NETWORK_METHOD,
  REQUEST_HEADER_KEYS,
  CONTENT_TYPES,
} from 'foundation/network';
import { RC_ITEM_API } from './constants';
import {
  RCItemSyncResponse,
  CallLogSyncParams,
  RCMessageSyncParams,
  RCMessageClearAllParams,
  CallLogClearAllParams,
} from './types/RCItemSync';
import { CallLog } from 'sdk/module/RCItems/callLog/entity';
import { RCMessage } from 'sdk/module/RCItems';
import { READ_STATUS } from 'sdk/module/RCItems/constants';

class RCItemApi extends Api {
  static deleteCallLog(ids: string[]) {
    const query = {
      path: `${RC_ITEM_API.CALL_LOG}/${ids.join(',')}`,
      method: NETWORK_METHOD.DELETE,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    };
    return RCItemApi.rcNetworkClient.http(query);
  }

  static syncCallLog(params: CallLogSyncParams) {
    const query = {
      params,
      path: `${RC_ITEM_API.CALL_LOG_SYNC}`,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    };
    return RCItemApi.rcNetworkClient.get<RCItemSyncResponse<CallLog>>(query);
  }

  static deleteAllCallLogs(params?: CallLogClearAllParams) {
    const query = {
      params,
      path: RC_ITEM_API.CALL_LOG,
      method: NETWORK_METHOD.DELETE,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    };
    return RCItemApi.rcNetworkClient.http(query);
  }

  static deleteMessage(ids: number[]) {
    const query = {
      path: `${RC_ITEM_API.MESSAGE_STORE}/${ids.join(',')}`,
      method: NETWORK_METHOD.DELETE,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    };
    return RCItemApi.rcNetworkClient.http(query);
  }

  static syncMessage<T extends RCMessage>(params: RCMessageSyncParams) {
    const query = {
      params,
      path: RC_ITEM_API.MESSAGE_SYNC,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      method: NETWORK_METHOD.GET,
    };
    return RCItemApi.rcNetworkClient.get<RCItemSyncResponse<T>>(query);
  }

  static deleteAllMessages(params: RCMessageClearAllParams) {
    const query = {
      params,
      path: RC_ITEM_API.MESSAGE_STORE,
      method: NETWORK_METHOD.DELETE,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    };
    return RCItemApi.rcNetworkClient.http(query);
  }

  static updateMessageReadStatus<T>(id: number, readStatus: READ_STATUS) {
    const query = {
      data: { readStatus },
      path: `${RC_ITEM_API.MESSAGE_STORE}/${id}`,
      method: NETWORK_METHOD.PUT,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      headers: {
        [REQUEST_HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
      },
    };
    return RCItemApi.rcNetworkClient.http<T>(query);
  }
}

export { RCItemApi };
