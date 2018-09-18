/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { action } from 'mobx';
import {
  withLoadingMore,
  withScroller,
  WithScrollerProps,
} from 'ui-components';
import { IPlugin } from '@/base/IPlugin';
import { IViewModel } from '@/base/IViewModel';
import { createFunctionDecorator } from '../utils';

const topListeners = Symbol('topListeners');
const bottomListeners = Symbol('bottomListeners');

interface ILoadingMoreViewModel extends IViewModel, WithScrollerProps {
  loadingTop: boolean;
  loadingBottom: boolean;
}

type LoadingMorePluginOptions = {
  initialScrollTop?: number;
  stickTo?: 'bottom' | 'top';
};

class LoadingMorePlugin implements IPlugin {
  private _options: LoadingMorePluginOptions;

  constructor(options?: LoadingMorePluginOptions) {
    this._options = options || {};
  }

  install(_vm: IViewModel): void {
    const vm = _vm.extendProps({
      loadingTop: false,
      loadingBottom: false,
      onScrollToTop: () => {},
      onScrollToBottom: () => {},
      ...this._options,
    });
    if (vm[topListeners]) {
      vm.onScrollToTop = action(async (...args: any[]) => {
        if (vm.loadingTop) return;

        vm.loadingTop = true;
        await Promise.all(
          vm[topListeners].map((fn: Function) => fn.apply(vm, args)),
        );
        vm.loadingTop = false;
      });
    }

    if (vm[bottomListeners]) {
      vm.onScrollToBottom = action(async (...args: any[]) => {
        if (vm.loadingBottom) return;

        vm.loadingBottom = true;
        await Promise.all(
          vm[bottomListeners].map((fn: Function) => fn.apply(vm, args)),
        );
        vm.loadingBottom = false;
      });
    }
  }

  wrapView(View: ComponentType<any>) {
    let WrappedView = View;
    WrappedView = withLoadingMore(WrappedView);
    WrappedView = withScroller(WrappedView);
    return WrappedView;
  }
}

const onScrollToTop = createFunctionDecorator({
  install(
    vm: ILoadingMoreViewModel,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    vm[topListeners] = vm[topListeners] || [];
    vm[topListeners].push(descriptor.value);
    return descriptor;
  },
});

const onScrollToBottom = createFunctionDecorator({
  install(
    vm: ILoadingMoreViewModel,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    vm[bottomListeners] = vm[bottomListeners] || [];
    vm[bottomListeners].push(descriptor.value);
    return descriptor;
  },
});

export {
  LoadingMorePlugin,
  ILoadingMoreViewModel,
  onScrollToTop,
  onScrollToBottom,
  LoadingMorePluginOptions,
};
