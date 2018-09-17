import { ComponentType } from 'react';
import { IPlugin } from '@/base/IPlugin';
import { LoadingPlugin, ILoadingViewModel, loading } from '../LoadingPlugin';
import {
  LoadingMorePlugin,
  ILoadingMoreViewModel,
  onScrollToTop,
  onScrollToBottom,
} from '../LoadingMorePlugin';

interface IInfiniteListViewModel
  extends ILoadingViewModel,
    ILoadingMoreViewModel {
  onScrollTop(): void;
  onScrollBottom(): void;
}

class InfiniteListPlugin implements IPlugin {
  private _loadingPlugin: LoadingPlugin;
  private _loadingMorePlugin: LoadingMorePlugin;

  constructor() {
    // TODO Child for AbstractPlugin that automatically apply child plugins.
    this._loadingPlugin = new LoadingPlugin();
    this._loadingMorePlugin = new LoadingMorePlugin();
  }

  install(vm: IInfiniteListViewModel): void {
    this._loadingPlugin.install(vm);
    this._loadingMorePlugin.install(vm);
  }

  wrapView(View: ComponentType<any>) {
    let WrappedView = View;
    WrappedView = this._loadingPlugin.wrapView(View);
    WrappedView = this._loadingMorePlugin.wrapView(WrappedView);
    return WrappedView;
  }
}

export {
  InfiniteListPlugin,
  IInfiniteListViewModel,
  loading,
  onScrollToTop,
  onScrollToBottom,
};
