/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-25 09:30:45
 * Copyright © RingCentral. All rights reserved.
 */

import { ERCWebUris } from '../types';
import { RCAuthApi, RCClientInfo } from 'sdk/api';
import { RCInfoFetchController } from './RCInfoFetchController';
import { mainLogger } from 'foundation/log';
import { UndefinedAble } from 'sdk/types';
import { JOB_KEY, jobScheduler } from 'sdk/framework/utils/jobSchedule';
/* eslint-disable */
const LOG_TAG = 'RCWebSettingInfoController';
const SAFE_SYNC_INTERVAL = 5 * 60 * 1000;
const DEFAULT_TTL = 5 * 60;
const AUTH_REPLACE_HOLDER = '{authCode}';
const MILLISECONDS_IN_ONE_SECOND = 1000;

class RCWebSettingInfoController {
  constructor(private _rcInfoFetchController: RCInfoFetchController) {}

  async getRCWebUriByType(type: ERCWebUris) {
    try {
      let finalUri = '';
      do {
        const clientInfo = await this._clientInfo();
        if (!clientInfo) {
          break;
        }
        const srcUri = await this._getWebSettingUri(type, clientInfo);
        if (!srcUri) {
          break;
        }

        if (!this._isAuthCodeNeeded(srcUri)) {
          finalUri = srcUri;
          break;
        }

        const clientId = await this._getInteropClientId(type, clientInfo);
        if (!clientId) {
          break;
        }
        const authInfo = await RCAuthApi.generateRCCode(clientId, DEFAULT_TTL);
        mainLogger.tags(LOG_TAG).log('success to request RC auth code', {
          authInfo,
          srcUri,
          clientId,
        });
        finalUri = this._buildRCAuthCodeUri(srcUri, authInfo.code);
      } while (false);

      return finalUri;
    } catch (error) {
      mainLogger.tags(LOG_TAG).warn('failed to getRCWebUriByType', { error });
      throw error;
    }
  }

  private _isAuthCodeNeeded(uri: string) {
    return uri.includes(AUTH_REPLACE_HOLDER);
  }

  private async _getInteropClientId(
    type: ERCWebUris,
    clientInfo: RCClientInfo,
  ) {
    let clientId: string | undefined;
    if (
      clientInfo &&
      clientInfo.provisioning &&
      clientInfo.provisioning.interopClientIds
    ) {
      const ids = clientInfo.provisioning.interopClientIds;
      switch (type) {
        case ERCWebUris.BILLING_URI:
        case ERCWebUris.PHONE_SYSTEM_URI:
        case ERCWebUris.EXTENSION_URI:
          clientId = ids.serviceWeb;
          break;
        case ERCWebUris.ANALYTIC_PORTAL_URI:
          clientId = ids.analyticsPortal;
          break;
        default:
          break;
      }
    }
    return clientId;
  }

  private _getWebSettingUri(type: ERCWebUris, clientInfo: RCClientInfo) {
    if (
      clientInfo &&
      clientInfo.provisioning &&
      clientInfo.provisioning.webUris
    ) {
      const webUris = clientInfo.provisioning.webUris;
      return webUris[type];
    }
    return undefined;
  }

  private async _clientInfo() {
    let clientInfo = await this._rcInfoFetchController.getRCClientInfo();
    if (!this._isWebSettingInfoValid(clientInfo)) {
      await this._rcInfoFetchController.requestRCClientInfo();
      clientInfo = await this._rcInfoFetchController.getRCClientInfo();
    }
    return clientInfo;
  }

  private _buildRCAuthCodeUri(srcUri: string, autoCode: string) {
    return srcUri.replace(AUTH_REPLACE_HOLDER, autoCode);
  }

  private _isWebSettingInfoValid(clientInfo: UndefinedAble<RCClientInfo>) {
    let result = false;
    do {
      if (!clientInfo) {
        break;
      }

      // TODO: check language, to do in  FIJI-5511

      const webUris =
        clientInfo.provisioning && clientInfo.provisioning.webUris;
      if (!webUris || !webUris.expiresIn) {
        break;
      }

      const duration = webUris.expiresIn * MILLISECONDS_IN_ONE_SECOND;
      const now = Date.now();
      if (now > this._getLastSyncTime + duration - SAFE_SYNC_INTERVAL) {
        break;
      }

      result = true;
    } while (false);
    return result;
  }

  private get _getLastSyncTime() {
    return (
      (jobScheduler.userConfig.getLastSuccessTime(
        JOB_KEY.FETCH_CLIENT_INFO,
      ) as number) || 0
    );
  }
}

export { RCWebSettingInfoController };
