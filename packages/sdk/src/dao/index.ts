/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:42:06
 * Copyright © RingCentral. All rights reserved.
 */
export * from '../framework/dao';
export * from './constants';
export * from './account/constants';
export * from './auth/constants';

export { default as schema } from './schema';

export { default as AccountDao } from './account';
export { default as AuthDao } from './auth';
export { default as DeactivatedDao } from './deactivated';

import DaoManager from './DaoManager';
const daoManager = new DaoManager();
export { daoManager };
