import * as mobx from 'mobx';
import { ENTITY_NAME, PERMISSION_KEYS } from './constants';
import { ENTITY_SETTING } from './config';
import storeManager from './base/StoreManager';

mobx.configure({
  computedRequiresReaction: process.env.NODE_ENV !== 'test',
  // enforceActions: 'observed',
});

export { ENTITY_NAME, ENTITY_SETTING, storeManager, PERMISSION_KEYS };

export default storeManager;
