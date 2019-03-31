import {
  NetworkManager,
  OAuthTokenManager,
  Token,
} from '../../../../packages/foundation/src';

import PostAPI from '../../../../packages/sdk/src/api/glip/post';
import {
  HandleByGlip2,
  Api,
  HandleByRingCentral,
  HandleByUpload,
} from '../../../../packages/sdk/src/api';

const chrisSandboxConfig = {
  rc: {
    server: 'https://api-glpdevxmn.lab.nordigy.ru',
    clientId: 'FVKGRbLRTxGxPempqg5f9g',
    clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
  },
  glip2: {
    server: 'https://api-glpdevxmn.lab.nordigy.ru',
    clientId: 'FVKGRbLRTxGxPempqg5f9g',
    clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
  },
  glip: {
    server: 'https://aws13-g04-uds02.asialab.glip.net:11904',
    cacheServer: 'https://aws13-g04-uds02.asialab.glip.net:11907',
  },
  glip_desktop: {
    server: 'https://aws13-g04-uds02.asialab.glip.net:11904',
    pathPrefix: '/v1.0/desktop'
  },
};

const token = {
  accessTokenExpireIn: 1,
  access_token:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ0b2tlbl9pZCI6MTU0MDg4MDc5MTk2MSwidHlwZSI6IndlYiIsInVpZCI6MTI1MDA5OTUsImlhdCI6MTU0MDg4MDc5MSwiaXNzIjoieG1udXAuYXNpYWxhYi5nbGlwLm5ldCIsInN1YiI6ImdsaXAifQ.y1WYXiZkDXp05hSyGnfc_gQ3fNkTplD5L2PBScsiRv5PCaUeW1dlafL5qNMKiXSP1nlCV4pguQyNExO4ANQGIA',
  refreshToken: undefined,
  refreshTokenExpireIn: 1,
  timestamp: 1540881167400,
};

function setUpUser(token: Token) {
  const oAuthToken = new OAuthTokenManager();
  [HandleByGlip2, HandleByRingCentral, HandleByGlip2, HandleByUpload].forEach(
    oAuthToken.setOAuthToken.bind(oAuthToken, token),
  );
  const networkManagerA = new NetworkManager(oAuthToken);
  Api.init(chrisSandboxConfig, networkManagerA);
}

async function testPostApi() {
  try {
    setUpUser(token);
    const postA = await PostAPI.getDataById(1491091460);
    const tokenB = {
      ...token,
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ0b2tlbl9pZCI6MTU0MDg4NjI5OTE0NywidHlwZSI6IndlYiIsInVpZCI6MTM3NjI1OSwiaWF0IjoxNTQwODg2Mjk5LCJpc3MiOiJhd3MxMy1nMDQtdWRzMDIuYXNpYWxhYi5nbGlwLm5ldCIsInN1YiI6ImdsaXAifQ.jTkAdwKqWQD_GpO87zZ4Lojz2ef5pogeAP-RT6pbDnioWGH3bjm912qGuFEiRdzzb-cFObIDryH8Ids1zW8Cng',
    };
    setUpUser(tokenB);
    const postB = await PostAPI.getDataById(616497156);
    console.log(postA, '\n', postB);
  } catch (e) {
    console.error(e);
  }
}

testPostApi();
