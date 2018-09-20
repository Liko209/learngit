/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:11
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { IPlugin } from '@/base/IPlugin';
import { LoadingPlugin, ILoadingViewModel, loading } from '../LoadingPlugin';
import {
  LoadingMorePlugin,
  ILoadingMoreViewModel,
  onScrollToTop,
  onScrollToBottom,
  loadingTop,
  loadingBottom,
  LoadingMorePluginOptions,
} from '../LoadingMorePlugin';

interface IInfiniteListViewModel
  extends ILoadingViewModel,
    ILoadingMoreViewModel {
  onScrollTop(): void;
  onScrollBottom(): void;
}

type InfiniteListPluginOptions = LoadingMorePluginOptions;

class InfiniteListPlugin implements IPlugin {
  private _loadingPlugin: LoadingPlugin;
  private _loadingMorePlugin: LoadingMorePlugin;
  private _options: InfiniteListPluginOptions;

  constructor(options?: InfiniteListPluginOptions) {
    this._options = options || {};
    // TODO Child for AbstractPlugin that automatically apply child plugins.
    this._loadingPlugin = new LoadingPlugin();
    this._loadingMorePlugin = new LoadingMorePlugin({
      // InfiniteList should trigger onScrollToTop/onScrollToBottom
      // event when mount
      triggerScrollToOnMount: true,
      ...this._options,
    });
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
  loadingTop,
  loadingBottom,
};
