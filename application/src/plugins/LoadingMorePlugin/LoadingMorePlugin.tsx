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
import { createFunctionWrapDecorator } from '../utils';

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

    // Call decorated function when scrollToTop
    if (vm[topListeners]) {
      vm.onScrollToTop = action(async (...args: any[]) => {
        if (vm.loadingTop) return;
        await Promise.all(
          vm[topListeners].map((fn: Function) => fn.apply(vm, args)),
        );
      });
    }

    // Call decorated function when scrollToBottom
    if (vm[bottomListeners]) {
      vm.onScrollToBottom = action(async (...args: any[]) => {
        if (vm.loadingBottom) return;
        await Promise.all(
          vm[bottomListeners].map((fn: Function) => fn.apply(vm, args)),
        );
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

const onScrollToTop = function (
  vm: IViewModel,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  vm[topListeners] = vm[topListeners] || [];
  vm[topListeners].push(descriptor.value);
  return descriptor;
};

const onScrollToBottom = function (
  vm: IViewModel,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  vm[bottomListeners] = vm[bottomListeners] || [];
  vm[bottomListeners].push(descriptor.value);
  return descriptor;
};

const loadingTop = createFunctionWrapDecorator({
  before(vm: ILoadingMoreViewModel) {
    vm.loadingTop = true;
  },
  after(vm: ILoadingMoreViewModel) {
    vm.loadingTop = false;
  },
});

const loadingBottom = createFunctionWrapDecorator({
  before(vm: ILoadingMoreViewModel) {
    vm.loadingBottom = true;
  },
  after(vm: ILoadingMoreViewModel) {
    vm.loadingBottom = false;
  },
});

export {
  LoadingMorePlugin,
  ILoadingMoreViewModel,
  onScrollToTop,
  loadingTop,
  loadingBottom,
  onScrollToBottom,
  LoadingMorePluginOptions,
};
