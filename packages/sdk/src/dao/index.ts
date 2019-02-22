/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:42:06
 * Copyright © RingCentral. All rights reserved.
 */
export * from '../framework/dao';
export * from './constants';
export * from './account/constants';
export * from './auth/constants';
export * from './config/constants';

export { default as schema } from './schema';

export { default as AccountDao } from './account';
export { default as AuthDao } from './auth';
export { default as CompanyDao } from './company';
export { default as ConfigDao } from './config';
export { default as GroupStateDao } from './groupState';
export { default as StateDao } from './state';
export { default as DeactivatedDao } from './deactivated';
export { default as GroupConfigDao } from './groupConfig';
export { default as VoIPDao } from './voip';

import DaoManager from './DaoManager';
const daoManager = new DaoManager();
export { daoManager };
