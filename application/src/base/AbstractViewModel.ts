import { extendObservable } from 'mobx';
import { IViewModel } from './IViewModel';

abstract class AbstractViewModel implements IViewModel {
  extendProps<T extends Object>(props: T): this & T {
    return extendObservable(this, props);
  }
}

export { AbstractViewModel };
