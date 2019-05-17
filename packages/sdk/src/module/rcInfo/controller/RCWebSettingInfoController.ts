/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-25 09:30:45
 * Copyright © RingCentral. All rights reserved.
 */

import { ERCWebSettingUri } from '../types';
import { RCAuthApi, RCClientInfo } from 'sdk/api';
import { RCInfoFetchController } from './RCInfoFetchController';
import { mainLogger } from 'foundation';
import { UndefinedAble } from 'sdk/types';
import { JOB_KEY, jobScheduler } from 'sdk/framework/utils/jobSchedule';

const LOG_TAG = 'RCWebSettingInfoController';
const SAFE_SYNC_INTERVAL = 5 * 60 * 1000;
const DEFAULT_TTL = 5 * 60;
const AUTH_REPLACE_HOLDER = '{authCode}';
const MILLISECONDS_IN_ONE_SECOND = 1000;

class RCWebSettingInfoController {
  constructor(private _rcInfoFetchController: RCInfoFetchController) {}

  async generateRCAuthCodeUri(type: ERCWebSettingUri) {
    let finalUri = '';
    try {
      const clientInfo = await this._clientInfo();
      if (!clientInfo) {
        return finalUri;
      }

      const clientId = await this._getInteropClientId(type, clientInfo);
      const srcUri = await this._getWebSettingUri(type, clientInfo);
      if (clientId && srcUri) {
        const authInfo = await RCAuthApi.generateRCCode(clientId, DEFAULT_TTL);
        mainLogger.tags(LOG_TAG).log('success to request RC auth code', {
          authInfo,
          srcUri,
          clientId,
        });
        finalUri = this._buildRCAuthCodeUri(srcUri, authInfo.code);
      }
      return finalUri;
    } catch (error) {
      mainLogger
        .tags(LOG_TAG)
        .warn('failed to generateRCAuthCodeUri', { error });
      throw error;
    }
  }

  private async _getInteropClientId(
    type: ERCWebSettingUri,
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
        case ERCWebSettingUri.BILLING_URI:
        case ERCWebSettingUri.PHONE_SYSTEM_URI:
        case ERCWebSettingUri.EXTENSION_URI:
          clientId = ids.serviceWeb;
          break;
        case ERCWebSettingUri.ANALYTIC_PORTAL_URI:
          clientId = ids.analyticsPortal;
          break;
        default:
          break;
      }
    }
    return clientId;
  }

  private _getWebSettingUri(type: ERCWebSettingUri, clientInfo: RCClientInfo) {
    let uri: string | undefined;
    if (
      clientInfo &&
      clientInfo.provisioning &&
      clientInfo.provisioning.webUris
    ) {
      const webUris = clientInfo.provisioning.webUris;
      switch (type) {
        case ERCWebSettingUri.ANALYTIC_PORTAL_URI:
          uri = webUris.analyticsPortal;
          break;
        case ERCWebSettingUri.BILLING_URI:
          uri = webUris.serviceWebBilling;
          break;
        case ERCWebSettingUri.EXTENSION_URI:
          uri = webUris.serviceWebUserSettings;
          break;
        case ERCWebSettingUri.PHONE_SYSTEM_URI:
          uri = webUris.serviceWebPhoneSystem;
          break;
        default:
          break;
      }
    }
    return uri;
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
