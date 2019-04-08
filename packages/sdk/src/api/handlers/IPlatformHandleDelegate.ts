import { IToken } from 'foundation';
export interface IPlatformHandleDelegate {
  refreshRCToken: () => Promise<IToken | null>;
  checkServerStatus: (
    callback: (success: boolean, retryAfter: number) => void,
  ) => void;
  onRefreshTokenFailure: (forceLogout: boolean) => void;
}
