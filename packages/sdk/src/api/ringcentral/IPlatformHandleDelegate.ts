import { ITokenModel } from './login';
export interface IPlatformHandleDelegate {
  refreshRCToken: () => Promise<ITokenModel | null>;
  checkServerStatus: (
    callback: (success: boolean, retryAfter: number) => void,
  ) => void;
  onRefreshTokenFailure: (forceLogout: boolean) => void;
}
