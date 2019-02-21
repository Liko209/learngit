import { configure } from 'mobx';
import { ENTITY_NAME } from './constants';
import { ENTITY_SETTING } from './config';
import storeManager from './base/StoreManager';

configure({
  computedRequiresReaction: true,
  // enforceActions: 'observed',
});

export { ENTITY_NAME, ENTITY_SETTING, storeManager };

export default storeManager;
