import StoreManager from './StoreManager';
import BaseNotificationSubscribable from './BaseNotificationSubscribable';
import MultiEntityMapStore from './MultiEntityMapStore';
import SingleEntityMapStore from './SingleEntityMapStore';
import { ENTITY_NAME } from '@/store';

export default class BasePresenter extends BaseNotificationSubscribable {
  updateEntityStore(entityName: string, entities: IEntity[]) {
    if (!entities.length) {
      return;
    }
    const storeManager = StoreManager.Instance;
    storeManager.dispatchUpdatedDataModels(entityName, entities);
  }

  getEntity(entityName: ENTITY_NAME, id: number) {
    const storeManager = StoreManager.Instance;
    const store = storeManager.getEntityMapStore(entityName) as MultiEntityMapStore;
    return store.get(id);
  }

  getSingleEntity(entityName: ENTITY_NAME, id: string) {
    const storeManager = StoreManager.Instance;
    const store = storeManager.getEntityMapStore(entityName) as SingleEntityMapStore;
    return store.get(id);
  }

  dispose() {
    super.dispose();
  }
}
