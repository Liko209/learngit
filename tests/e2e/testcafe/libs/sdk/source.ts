import { NetworkManager, IToken, Token } from 'foundation';
import { ApiConfig } from 'sdk/src/types';
import { RCPasswordAuthenticateParams } from 'sdk/src/authenticator';
import { Api } from 'sdk/src/api';

interface ISDK{

}

interface IPlatform{

}

class SDK implements ISDK {
  private apiConfig:ApiConfig;
  constructor(apiConfig:ApiConfig) {
    this.apiConfig = apiConfig;
  }
  platform() {
    return new Platform(this.apiConfig);
  }
}

class Platform implements IPlatform {
  private networkManager:NetworkManager;
  constructor(config:ApiConfig) {
    Api.init(config);
    this.networkManager = NetworkManager.Instance;
  }
  async login(params: RCPasswordAuthenticateParams) {
    const rcAuthData = await loginRCByPassword(params);
    const glipAuthData = await loginGlip(rcAuthData.data);
    this._updateToken(glipAuthData.headers['x-authorization'], rcAuthData.data);
  }

  private _updateToken(access_token:string, rcToken:IToken) {
    if (!access_token) {
      return console.warn('access token undefined');
    }
    this.networkManager.setOAuthToken(new Token(access_token), HandleByGlip);
    this.networkManager.setOAuthToken(new Token(access_token), HandleByUpload);
    this.networkManager.setOAuthToken(rcToken, HandleByRingCentral);
    this.networkManager.setOAuthToken(rcToken, HandleByGlip2);
  }
}
// export { SDK as SDKLite };
