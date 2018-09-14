import { ComponentType } from 'react';
import { AbstractPlugin } from '@/base/AbstractPlugin';
import { IViewModel } from '@/base/IViewModel';
import { LoadingPlugin, loading } from './LoadingPlugin';
import {
  LoadingMorePlugin,
  loadingTop,
  loadingBottom,
} from './LoadingMorePlugin';

interface IInfiniteListViewModel extends IViewModel {
  onScrollTop(): void;
  onScrollBottom(): void;
}

class InfiniteListPlugin extends AbstractPlugin {
  private _loadingPlugin: LoadingPlugin;
  private _loadingMorePlugin: LoadingMorePlugin;

  constructor() {
    super();
    // TODO Child for AbstractPlugin that automatically apply child plugins.
    this._loadingPlugin = new LoadingPlugin();
    this._loadingMorePlugin = new LoadingMorePlugin();
  }

  beforeInstall(vm: IViewModel): void {
    this._loadingPlugin.install(vm);
    this._loadingMorePlugin.install(vm);
  }

  wrapView(View: ComponentType<any>) {
    let WrappedView = View;
    WrappedView = this._loadingPlugin.wrapView(View);
    WrappedView = this._loadingMorePlugin.wrapView(WrappedView);
    return WrappedView;
  }

  uninstall() {
    // TODO handle uninstall
    console.log(this.vm);
  }
}

export {
  InfiniteListPlugin,
  IInfiniteListViewModel,
  loading,
  loadingTop,
  loadingBottom,
};
