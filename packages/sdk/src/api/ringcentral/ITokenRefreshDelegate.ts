import { ITokenModel } from './login';
export interface ITokenRefreshDelegate {
  refreshRCToken: () => Promise<ITokenModel | null>;
}
