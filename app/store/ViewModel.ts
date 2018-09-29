import { extendObservable } from 'mobx';
import { IViewModel } from '@/base/IViewModel';
import BaseNotificationSubscribable from './base/BaseNotificationSubscribable';

class StoreViewModel extends BaseNotificationSubscribable
  implements IViewModel {
  extendProps<T extends Object>(props: T): this & T {
    return extendObservable(this, props);
  }
}

export default StoreViewModel;
export { StoreViewModel };
