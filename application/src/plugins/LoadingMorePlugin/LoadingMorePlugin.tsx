import { ComponentType } from 'react';
import { action } from 'mobx';
import {
  withLoadingMore,
  withScroller,
  WithLoadingMoreProps,
  WithScrollerProps,
} from 'ui-components';
import { AbstractPlugin } from '@/base/AbstractPlugin';
import { IViewModel } from '@/base/IViewModel';
import { createFunctionDecorator } from '../utils';

const topListeners = Symbol('topListeners');
const bottomListeners = Symbol('bottomListeners');

interface ILoadingMoreViewModel
  extends IViewModel,
    WithLoadingMoreProps,
    WithScrollerProps {}

class LoadingMorePlugin extends AbstractPlugin {
  afterInstall(vm: ILoadingMoreViewModel): void {
    this.extendViewModel({
      loadingTop: false,
      loadingBottom: false,
    });

    if (vm[topListeners]) {
      vm.onScrollToTop = action(async () => {
        if (vm.loadingTop) return;

        vm.loadingTop = true;
        await Promise.all(
          vm[topListeners].map((fn: Function) => fn.apply(vm, arguments)),
        );
        vm.loadingTop = false;
      });
    }

    if (vm[bottomListeners]) {
      vm.onScrollToBottom = action(async () => {
        if (vm.loadingBottom) return;

        vm.loadingBottom = true;
        await Promise.all(
          vm[bottomListeners].map((fn: Function) => fn.apply(vm, arguments)),
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

  uninstall() {
    // TODO handle uninstall
    console.log(this.vm);
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

export { LoadingMorePlugin, onScrollToTop, onScrollToBottom };
