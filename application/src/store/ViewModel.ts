import {
  extendObservable,
  autorun,
  reaction,
  when,
  IReactionDisposer,
  IReactionPublic,
  IAutorunOptions,
  IReactionOptions,
  Lambda,
  IWhenOptions,
} from 'mobx';
import { IViewModel } from '@/base/IViewModel';
import BaseNotificationSubscribable from './base/BaseNotificationSubscribable';

class StoreViewModel extends BaseNotificationSubscribable
  implements IViewModel {
  private _reactionDisposers: IReactionDisposer[] = [];

  protected autorun(view: (r: IReactionPublic) => any, opts?: IAutorunOptions) {
    const disposer = autorun(view, opts);
    this._reactionDisposers.push(disposer);
    return disposer;
  }

  protected reaction<T>(
    expression: (r: IReactionPublic) => T,
    effect: (arg: T, r: IReactionPublic) => void,
    opts?: IReactionOptions,
  ) {
    const disposer = reaction(expression, effect, opts);
    this._reactionDisposers.push(disposer);
    return disposer;
  }

  protected when(
    predicate: () => boolean,
    effect?: Lambda,
    opts?: IWhenOptions,
  ) {
    if (effect) {
      return when(predicate, effect, opts);
    }
    return when(predicate, opts);
  }

  extendProps<T extends Object>(props: T): this & T {
    return extendObservable(this, props);
  }

  dispose() {
    super.dispose();
    this._reactionDisposers.forEach(disposer => disposer());
  }
}

export default StoreViewModel;
export { StoreViewModel };
