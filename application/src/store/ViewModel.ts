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
  observable,
  computed,
} from 'mobx';
import { IViewModel } from '@/base/IViewModel';
import BaseNotificationSubscribable from './base/BaseNotificationSubscribable';
import _ from 'lodash';

abstract class StoreViewModel<P = {}> extends BaseNotificationSubscribable
  implements IViewModel<P> {
  private _reactionDisposers: IReactionDisposer[] = [];

  @observable
  private _props: P;

  @computed
  protected get props() {
    return this._props || {};
  }

  onReceiveProps?(props: P): void;

  getDerivedProps(props: P) {
    if (!this._props) {
      this._props = props;
    } else {
      for (const key in props) {
        if (typeof props[key] !== 'object') {
          if (this._props[key] !== props[key]) {
            this._props[key] = props[key];
          }
        } else if (Array.isArray(props[key])) {
          const arr: any = this._props[key];
          if (!_.isEqual([...arr], props[key])) {
            this._props[key] = props[key];
          }
        } else {
          if (!_.isEqual(this.props[key], props[key])) {
            this._props[key] = props[key];
          }
        }
      }
    }
  }

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
