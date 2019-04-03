/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-22 15:03:27
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IToken,
  ITokenHandler,
  IRequest,
  IHandleType,
  NETWORK_VIA,
  NETWORK_HANDLE_TYPE,
} from './network';
import { Base64 } from 'js-base64';

abstract class AbstractHandleType implements IHandleType {
  name: NETWORK_HANDLE_TYPE = NETWORK_HANDLE_TYPE.DEFAULT;
  defaultVia: NETWORK_VIA = NETWORK_VIA.HTTP;
  survivalModeSupportable: boolean = false;
  tokenExpirable: boolean = false;
  tokenRefreshable: boolean = false;
  doRefreshToken(token: IToken) {
    return new Promise<IToken>((resolve, reject) => {
      reject();
    });
  }
  checkServerStatus = (
    callback: (success: boolean, interval: number) => void,
  ) => {
    callback(true, 0);
  }
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
  requestDecoration(tokenHandler: ITokenHandler) {
    return (request: IRequest) => {
      return request;
    };
  }
}
export default AbstractHandleType;
