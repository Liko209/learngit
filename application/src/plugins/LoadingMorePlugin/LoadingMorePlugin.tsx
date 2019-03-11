/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:03
 * Copyright © RingCentral. All rights reserved.
 */

import { action } from 'mobx';
import { withLoadingMore, withScroller, WithScrollerProps } from 'jui/hoc';
import { IPlugin } from '@/base/IPlugin';
import { IViewModel } from '@/base/IViewModel';
import { createLoadingStateDecorator } from '../utils';
import { ComponentType } from 'react';
const topListeners = Symbol('topListeners');
const bottomListeners = Symbol('bottomListeners');
const scrollListeners = Symbol('scrollListeners');

interface ILoadingMoreViewModel extends IViewModel, WithScrollerProps {
  loadingTop: boolean;
  loadingBottom: boolean;
}

type LoadingMorePluginOptions = {
  thresholdUp?: number;
  thresholdDown?: number;
  stickTo?: 'bottom' | 'top';
  throttle?: number;
  triggerScrollToOnMount?: boolean;
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
      onScroll: () => {},
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

    // Call decorated function when scroll
    if (vm[scrollListeners]) {
      vm.onScroll = action((...args: any[]) => {
        vm[scrollListeners].map((fn: Function) => fn.apply(vm, args));
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

const onScrollToTop = function (condition: (vm: IViewModel) => boolean) {
  return function (
    vm: IViewModel,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    vm[topListeners] = vm[topListeners] || [];
    vm[topListeners].push(function (this: IViewModel) {
      if (condition(this)) {
        return descriptor.value.apply(this, arguments);
      }
    });
    return descriptor;
  };
};

const onScrollToBottom = function (condition: (vm: IViewModel) => boolean) {
  return function (
    vm: IViewModel,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    vm[bottomListeners] = vm[bottomListeners] || [];
    vm[bottomListeners].push(function (this: IViewModel) {
      if (condition(this)) {
        return descriptor.value.apply(this, arguments);
      }
    });
    return descriptor;
  };
};

const onScroll = function (
  vm: IViewModel,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  vm[scrollListeners] = vm[scrollListeners] || [];
  vm[scrollListeners].push(descriptor.value);
  return descriptor;
};

const loadingTop = createLoadingStateDecorator('loadingTop');
const loadingBottom = createLoadingStateDecorator('loadingBottom');

export {
  LoadingMorePlugin,
  ILoadingMoreViewModel,
  onScrollToTop,
  loadingTop,
  loadingBottom,
  onScrollToBottom,
  onScroll,
  LoadingMorePluginOptions,
};
