/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-17 20:35:22
 * Copyright © RingCentral. All rights reserved.
 */
import {
  loginRCByPassword,
  loginGlip2ByPassword,
  refreshToken,
  ITokenModel,
  requestServerStatus,
} from './ringcentral/login';
import { IPlatformHandleDelegate } from './ringcentral/IPlatformHandleDelegate';
import { loginGlip, indexData, initialData, remainingData } from './glip/user';
export { default as Api } from './api';
export {
  loginRCByPassword,
  loginGlip2ByPassword,
  refreshToken,
  loginGlip,
  indexData,
  initialData,
  remainingData,
  IPlatformHandleDelegate,
  ITokenModel,
  requestServerStatus,
};
export * from './handlers';
export * from './parser';
