/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-06 19:12:01
 * Copyright © RingCentral. All rights reserved.
 */
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
    opts?: IWhenOptions,
  ): Promise<void> & {
    cancel(): void;
  };
  protected when(
    predicate: () => boolean,
    effect: Lambda,
    opts?: IWhenOptions,
  ): IReactionDisposer;
  protected when(arg0: any, arg1?: any, arg2?: any) {
    if (arguments.length === 2) {
      return when(arg0, arg1);
    }
    return when(arg0, arg1, arg2);
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
