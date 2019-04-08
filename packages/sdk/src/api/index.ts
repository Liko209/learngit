/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-17 20:35:22
 * Copyright © RingCentral. All rights reserved.
 */

export { default as Api } from './api';
export * from './ringcentral';
export {
  loginGlip,
  indexData,
  initialData,
  remainingData,
  glipStatus,
} from './glip/user';
export { IPlatformHandleDelegate } from './handlers/IPlatformHandleDelegate';
export * from './handlers';
export * from './parser';
