import { TokenModel } from './login';
export interface ITokenRefreshDelegate {
  refreshRCToken: () => Promise<TokenModel | null>;
}
