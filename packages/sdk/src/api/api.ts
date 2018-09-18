/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-02 16:47:08
 * Copyright © RingCentral. All rights reserved.
 */
import merge from 'lodash/merge';
import NetworkClient, {
  INetworkRequests,
  IResponse,
  IResponseError,
} from './NetworkClient';
import { ApiConfig, HttpConfigType, PartialApiConfig } from '../types';
import { Throw, ErrorTypes, Aware } from '../utils';
import { defaultConfig } from './defaultConfig';
import { Raw } from '../models';

import { IHandleType, NetworkSetup, NetworkManager } from 'foundation';
import {
  HandleByGlip,
  HandleByRingCentral,
  HandleByGlip2,
  HandleByUpload,
} from './handlers';
const types = [
  HandleByGlip,
  HandleByRingCentral,
  HandleByGlip2,
  HandleByUpload,
];
class Api {
  static basePath = '';
  static httpSet: Map<string, NetworkClient> = new Map();
  static _httpConfig: ApiConfig;

  static init(config: PartialApiConfig): void {
    this._httpConfig = merge({}, defaultConfig, config);
    Api.setupHandlers();
  }

  static setupHandlers() {
    NetworkSetup.setup(types);
    // This explicit set rc handler accessToken as the RC token provider for glip handler
    const tokenManager = NetworkManager.Instance.getTokenManager();
    const rcTokenHandler =
      tokenManager && tokenManager.getOAuthTokenHandler(HandleByRingCentral);
    HandleByGlip.rcTokenProvider =
      rcTokenHandler && rcTokenHandler.accessToken.bind(rcTokenHandler);
  }

  static get httpConfig() {
    // TODO httpConfig should be private. but for now, it is
    // directly accessed by the ui layer. That should be refactor.
    // Move logics that access httpConfig into Api in the future.
    // tslint:disable-next-line:max-line-length
    Aware(
      ErrorTypes.HTTP,
      'httpConfig should be private. but it is directly accessed by the ui layer.',
    );
    return this._httpConfig;
  }

  static getNetworkClient(
    name: HttpConfigType,
    type: IHandleType,
  ): NetworkClient {
    if (!this._httpConfig) Throw(ErrorTypes.HTTP, 'Api not initialized');

    let networkClient = this.httpSet.get(name);
    if (!networkClient) {
      const currentConfig = this._httpConfig[name];
      const networkRequests: INetworkRequests = {
        host: currentConfig.server,
        handlerType: type,
      };
      networkClient = new NetworkClient(
        networkRequests,
        currentConfig.apiPlatform,
        type.defaultVia,
        currentConfig.apiPlatformVersion,
      );
      this.httpSet.set(name, networkClient);
    }
    return networkClient;
  }

  static get glipNetworkClient() {
    return this.getNetworkClient('glip', HandleByGlip);
  }

  static get glip2NetworkClient() {
    return this.getNetworkClient('glip2', HandleByGlip2);
  }

  static get glipDesktopNetworkClient() {
    return this.getNetworkClient('glip_desktop', HandleByGlip);
  }

  static get rcNetworkClient() {
    return this.getNetworkClient('rc', HandleByRingCentral);
  }

  static get uploadNetworkClient() {
    return this.getNetworkClient('upload', HandleByUpload);
  }

  static getDataById<T>(id: number): Promise<IResponse<Raw<T>>> {
    return this.glipNetworkClient.get(`${this.basePath}/${id}`);
  }
  static postData<T>(
    data: Partial<T>,
  ): Promise<IResponse<Raw<T> & IResponseError>> {
    return this.glipNetworkClient.post(`${this.basePath}`, data);
  }
  static putDataById<T>(
    id: number,
    data: Partial<T>,
  ): Promise<IResponse<Raw<T>>> {
    return this.glipNetworkClient.put(`${this.basePath}/${id}`, data);
  }
}

export default Api;
