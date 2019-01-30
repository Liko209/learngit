/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 13:45:49
 * Copyright © RingCentral. All rights reserved.
 */

import { NETWORK_VIA, NETWORK_METHOD } from 'foundation';
import Api from '../api';
import { GLIP_API } from './constants';
import { Raw } from '../../framework/model';
import { Company } from '../../module/company/entity';
import { Item } from '../../module/item/entity';
import { State } from '../../module/state/entity';
import { Person } from '../../module/person/entity';
import { Group } from '../../module/group/entity';
import { Post } from '../../module/post/entity';
import { RawPresence } from '../../module/presence/entity';
import { Profile } from '../../module/profile/entity';

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
  public_teams?: Raw<Group>[];
  groups?: Raw<Group>[];
  teams?: Raw<Group>[];
  posts?: Raw<Post>[];
  max_posts_exceeded?: boolean;
  timestamp?: number;
  scoreboard?: string;
  client_config: IFlag;
  static_http_server: string;
};
/**
 * @param {string} rcAccessTokenData
 * @param {string} username
 * @param {string} password
 * @param {boolean} mobile(option)
 * get glip 1.0 api's request header (x-authorization) by authData
 */
function loginGlip(authData: object) {
  const model = {
    rc_access_token_data: btoa(JSON.stringify(authData)),
  };
  const query = {
    path: GLIP_API.API_OAUTH_TOKEN,
    method: NETWORK_METHOD.PUT,
    data: model,
    authFree: true,
  };
  return Api.glipNetworkClient.http<Object>({
    ...query,
    via: NETWORK_VIA.HTTP,
  });
}

/**
 * @param {string} rcAccessTokenData
 * @param {string} username
 * @param {string} password
 * index data api
 */
function indexData(params: object, requestConfig = {}, headers = {}) {
  return Api.glipNetworkClient.get<IndexDataModel>(
    '/index',
    params,
    NETWORK_VIA.HTTP,
    requestConfig,
    headers,
  );
}

function initialData(params: object, requestConfig = {}, headers = {}) {
  return Api.glipDesktopNetworkClient.get<IndexDataModel>(
    '/initial',
    params,
    NETWORK_VIA.HTTP,
    requestConfig,
    headers,
  );
}

function remainingData(params: object, requestConfig = {}, headers = {}) {
  return Api.glipDesktopNetworkClient.get<IndexDataModel>(
    '/remaining',
    params,
    NETWORK_VIA.HTTP,
    requestConfig,
    headers,
  );
}

// plugins data

export { loginGlip, indexData, initialData, remainingData };
