/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:37:39
 * Copyright © RingCentral. All rights reserved.
 */

import { History } from 'history';
import { parse, stringify } from 'qs';
import config from '@/config';
import { getLanguage } from './helper';

const defaultOptions = {
  response_type: 'code',
  brand_id: '1210',
  force: true,
  endpointId: '',
  display: 'touch',
  prompt: 'login sso',
  scope: '',
  ui_options: 'external_popup remember_me_on show_back_to_app',
  hideNavigationBar: true,
  glip_auth: true,
  response_hint: 'remember_me+login_type',
  title_bar: true,
};

const getUrl = (location: History.LocationState) => {
  const { rc, glip } = config.get('api');
  const url = `${rc.server}${rc.pathPrefix || ''}/oauth/authorize`;
  const { from } = location.state || { from: {} };
  const { pathname = '/', search = '', hash = '' } = from;
  const parsedSearch = parse(search, { ignoreQueryPrefix: true });
  parsedSearch.env = config.getEnv();
  const updatedSearch = `?${stringify(parsedSearch)}`;
  const state = pathname + updatedSearch.replace('&', '$') + hash;
  const redirect_uri = window.location.origin; // The URI must match exactly with the sandbox configuration
  const glipApiBaseURL = glip.apiServer;
  const glipAppRedirectURL = `${redirect_uri}?t=`;
  const options = {
    redirect_uri,
    state,
    glipApiBaseURL,
    glipAppRedirectURL,
    client_id: rc.clientId,
    ui_locales: getLanguage(), // default en_US
  };
  const params = { ...defaultOptions, ...options };
  return `${url}?${stringify(params)}`;
};

export { defaultOptions };
export default getUrl;

// Auth wiki
// https://wiki.ringcentral.com/pages/viewpage.action?pageId=207394909

// Glip sign In
// https://service.ringcentral.com/login/unifiedLoginM.html?
// session=-8895747689600087505
// &responseType=code
// &clientId=cZPfEqZkQxKa9dUEu9RkCA
// &brandId=1210
// &state=/rc
// &localeId=en_US
// &endpointId=
// &display=touch
// &prompt=login sso
// &scope=
// &appUrlScheme=https://app.glip.com/api/no-auth/rc-signon
// &ui_options=external_popup remember_me_on show_back_to_app
// &hideNavigationBar=true
// &glip_auth=true
// &response_hint=remember_me+login_type
// &title_bar=true
