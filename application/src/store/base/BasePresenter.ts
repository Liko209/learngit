import StoreManager from './StoreManager';
import BaseNotificationSubscribable from './BaseNotificationSubscribable';
import { IEntity } from '../store';

export default class BasePresenter<T> extends BaseNotificationSubscribable {
  updateEntityStore(entityName: string, entities: IEntity[]) {
    if (!entities.length) {
      return;
    }
    const storeManager = StoreManager.Instance;
    storeManager.dispatchUpdatedDataModels(entityName, entities);
  }

  dispose() {
    super.dispose();
  }
}
