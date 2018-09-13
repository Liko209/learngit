import { extendObservable } from 'mobx';
import { IViewModel } from './IViewModel';

abstract class AbstractViewModel implements IViewModel {
  extendViewProps(key: string, value?: any) {
    extendObservable(this, key, value);
  }
}

export { AbstractViewModel };
