/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType } from 'react';

import { action } from 'mobx';
import { withLoadingMore, withScroller, WithScrollerProps } from 'jui/hoc';
import { IPlugin } from '@/base/IPlugin';
import { IViewModel } from '@/base/IViewModel';
import { createLoadingStateDecorator } from '../utils';
import { TScroller } from 'jui/hoc/withScroller';
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
  initialScrollTop?: number;
  stickTo?: 'bottom' | 'top';
  triggerScrollToOnMount?: boolean;
};

class LoadingMorePlugin implements IPlugin {
  private _options: LoadingMorePluginOptions;
  private scroller: TScroller;
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

  private _forwardRefs = (viewRefs?: any) => {
    return this._setScroller.bind(this, viewRefs);
  }

  private _setScroller = (viewRefs: any, scroller: TScroller) => {
    if (scroller) {
      this.scroller = scroller;
    }
    if (viewRefs) {
      viewRefs.scroller = scroller;
    }
  }

  scrollToRow = (n: number) => {
    this.scroller.scrollToRow(n);
  }

  wrapView(View: ComponentType<any>): React.SFC<any> {
    let WrappedView = View;
    WrappedView = withLoadingMore(WrappedView);
    WrappedView = withScroller(WrappedView);
    return (props: any) => (
      <WrappedView {...props} ref={this._forwardRefs(props.viewRefs)} />
    );
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
