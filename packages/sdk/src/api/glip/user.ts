/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 13:45:49
 * Copyright © RingCentral. All rights reserved.
 */

import { NETWORK_VIA, NETWORK_METHOD } from 'foundation';
import { IResponse } from '../NetworkClient';
import Api from '../api';
import { GLIP_API } from './constants';
import {
  Raw,
  Company,
  Item,
  Profile,
  State,
  Person,
  Group,
  Post,
  RawPresence,
} from '../../models';
import { IFlag } from '../../component/featureFlag/interface';

export type IndexDataModel = {
  user_id: number;
  company_id: number;
  profile?: Raw<Profile>;
  companies?: Raw<Company>[];
  items?: Raw<Item>[];
  presences?: RawPresence[];
  state?: Raw<State>;
  people?: Raw<Person>[];
  groups?: Raw<Group>[];
  teams?: Raw<Group>[];
  posts?: Raw<Post>[];
  max_posts_exceeded?: boolean;
  timestamp?: number;
  scoreboard?: string;
  client_config: IFlag;
};

type IndexResponse = IResponse<IndexDataModel>;

/**
 * @param {string} rcAccessTokenData
 * @param {string} username
 * @param {string} password
 * @param {boolean} mobile(option)
 * get glip 1.0 api's requset header (x-authorization) by authData
 */
function loginGlip(authData: object): Promise<IResponse<Object>> {
  const model = {
    rc_access_token_data: btoa(JSON.stringify(authData)),
  };
  const query = {
    path: GLIP_API.API_OAUTH_TOKEN,
    method: NETWORK_METHOD.PUT,
    data: model,
    authFree: true,
  };
  return Api.glipNetworkClient.http({ ...query, via: NETWORK_VIA.HTTP });
}

/**
 * @param {string} rcAccessTokenData
 * @param {string} username
 * @param {string} password
 * index data api
 */
function indexData(params: object, requestConfig = {}, headers = {}): Promise<IndexResponse> {
  return Api.glipNetworkClient.get('/index', params, NETWORK_VIA.HTTP, requestConfig, headers);
}

function initialData(params: object, requestConfig = {}, headers = {}): Promise<IndexResponse> {
  return Api.glipDesktopNetworkClient
    .get('/initial', params, NETWORK_VIA.HTTP, requestConfig, headers);
}

function remainingData(params: object, requestConfig = {}, headers = {}): Promise<IndexResponse> {
  return Api.glipDesktopNetworkClient
    .get('/remaining', params, NETWORK_VIA.HTTP, requestConfig, headers);
}

// plugins data

export {
  loginGlip,
  indexData,
  initialData,
  remainingData,
};
