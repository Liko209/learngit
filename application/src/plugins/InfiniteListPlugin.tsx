import { ComponentType } from 'react';
import { AbstractPlugin } from '@/base/AbstractPlugin';
import { LoadingPlugin, loading } from './LoadingPlugin';
import {
  LoadingMorePlugin,
  loadingTop,
  loadingBottom,
} from './LoadingMorePlugin';

interface IInfiniteListViewModel {
  onScrollTop(): void;
  onScrollBottom(): void;
}

class InfiniteListPlugin extends AbstractPlugin {
  loadingPlugin: LoadingPlugin;
  loadingMorePlugin: LoadingMorePlugin;

  constructor() {
    super();
    this.loadingPlugin = new LoadingPlugin();
    this.loadingMorePlugin = new LoadingMorePlugin();
  }

  afterInstall(): void {
    this.loadingPlugin.afterInstall();
    this.loadingMorePlugin.afterInstall();
  }

  wrapView(View: ComponentType<any>) {
    let WrappedView = View;
    WrappedView = this.loadingPlugin.wrapView(View);
    WrappedView = this.loadingMorePlugin.wrapView(WrappedView);
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
