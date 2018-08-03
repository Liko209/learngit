/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 17:54:13
 * @Last Modified by: Lily.li (lily.li@ringcentral.com)
 * @Last Modified time: 2018-06-21 12:15:37
 */
import { NETWORK_VIA, NETWORK_METHOD } from 'foundation';
import { IResponse } from '../NetworkClient';
import Api from '../api';
import { GLIP_API } from './constants';
import { Raw, Company, Item, Profile, Presence, State, Person, Group, Post } from '../../models';

export type IndexDataModel = {
  user_id: number;
  company_id: number;
  profile?: Raw<Profile>;
  companies?: Raw<Company>[];
  items?: Raw<Item>[];
  presences?: Raw<Presence>[];
  state?: Raw<State>;
  people?: Raw<Person>[];
  groups?: Raw<Group>[];
  teams?: Raw<Group>[];
  posts?: Raw<Post>[];
  max_posts_exceeded?: boolean;
  timestamp?: number;
  scoreboard?: string;
  client_config: object;
};

/**
 * @param {string} rcAccessTokenData
 * @param {string} username
 * @param {string} password
 * @param {boolean} mobile(option)
 * get glip 1.0 api's requset header (x-authorization) by authData
 */
export function loginGlip(authData: object): Promise<IResponse<Object>> {
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
export function indexData(params: object, requestConfig = {}, headers = {}): Promise<IResponse<IndexDataModel>> {
  return Api.glipNetworkClient.get('/index', params, NETWORK_VIA.HTTP, requestConfig, headers);
}
