/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 16:20:09
 * Copyright © RingCentral. All rights reserved.
 */
import { stringify } from 'qs';
import getUrl, { defaultOptions } from '../getUrl';
import { DeepPartial, ApiConfig } from 'sdk/types';

jest.mock('@/config', () => ({
  get: jest.fn(
    (): DeepPartial<ApiConfig> => {
      return {
        rc: {
          server: 'server',
          pathPrefix: '/apiPlatform',
          clientId: 'clientId',
        },
        glip: {
          apiServer: 'API_SERVER',
        },
      };
    },
  ),
  getEnv: jest.fn(() => {
    return 'test_sandbox';
  }),
}));

jest.mock('../helper', () => {
  return {
    getLanguage: jest.fn().mockImplementation(() => {
      return 'en-US';
    }),
  };
});

describe('getUrl method', () => {
  it('format url', async () => {
    const options = {
      redirect_uri: window.location.origin,
      state: '/?env=test_sandbox',
      glipApiBaseURL: 'API_SERVER',
      glipAppRedirectURL: `${window.location.origin}?t=`,
      client_id: 'clientId',
      ui_locales: 'en-US',
    };
    const params = { ...defaultOptions, ...options };
    const server = 'server/apiPlatform/oauth/authorize';
    const url = getUrl({});
    expect(url).toBe(`${server}?${stringify(params)}`);
  });
});
