/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-22 15:03:27
 * Copyright © RingCentral. All rights reserved.
 */
import { Base64 } from 'js-base64';
import {
  IToken,
  IRequest,
  IHandleType,
  NETWORK_VIA,
  NETWORK_HANDLE_TYPE,
  ITokenHandler,
} from './network';

abstract class AbstractHandleType implements IHandleType {
  name: NETWORK_HANDLE_TYPE = NETWORK_HANDLE_TYPE.DEFAULT;
  defaultVia: NETWORK_VIA = NETWORK_VIA.HTTP;
  survivalModeSupportable: boolean = false;
  tokenExpirable: boolean = false;
  tokenRefreshable: boolean = false;

  doRefreshToken() {
    return new Promise<IToken>((resolve, reject) => {
      reject();
    });
  }

  checkServerStatus = (
    callback: (success: boolean, interval: number) => void,
  ) => {
    callback(true, 0);
  };
  onRefreshTokenFailure = (forceLogout: boolean) => {};

  basic() {
    return '';
  }

  btoa(str: string) {
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(str);
    }
    return Base64.btoa(str);
  }

  requestDecoration(handler: ITokenHandler): (request: IRequest) => boolean {
    return () => {
      return true;
    };
  }
}
export default AbstractHandleType;
