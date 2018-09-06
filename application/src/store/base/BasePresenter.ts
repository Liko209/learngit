import { BaseModel } from 'sdk/models';
import StoreManager from './StoreManager';
import BaseNotificationSubscribable from './BaseNotificationSubscribable';
import MultiEntityMapStore from './MultiEntityMapStore';
import SingleEntityMapStore from './SingleEntityMapStore';
import { ENTITY_NAME } from './constants';
import { IEntity } from '../store';
import Base from '@/store/models/Base';

export default class BasePresenter extends BaseNotificationSubscribable {
  updateEntityStore(entityName: string, entities: IEntity[]) {
    if (!entities.length) {
      return;
    }
    const storeManager = StoreManager.Instance;
    storeManager.dispatchUpdatedDataModels(entityName, entities);
  }

  getEntity<T extends BaseModel, K extends Base<T>>(entityName: ENTITY_NAME, id: number) {
    const storeManager = StoreManager.Instance;
    const store = storeManager.getEntityMapStore(entityName) as MultiEntityMapStore<T, K>;
    return store.get(id);
  }

  getSingleEntity<T extends BaseModel, K extends Base<T>>(entityName: ENTITY_NAME, id: keyof K) {
    const storeManager = StoreManager.Instance;
    const store = storeManager.getEntityMapStore(entityName) as SingleEntityMapStore<T, K>;
    return store.get(id);
  }

  dispose() {
    super.dispose();
  }
}
