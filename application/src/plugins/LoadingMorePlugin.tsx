import { ComponentType } from 'react';
import { withLoadingMore } from 'ui-components';
import { AbstractPlugin } from '@/base/AbstractPlugin';

class LoadingMorePlugin extends AbstractPlugin {
  afterInstall(): void {
    this.extendViewModel({
      loadingTop: false,
      loadingBottom: false,
    });
  }

  wrapView(View: ComponentType<any>) {
    return withLoadingMore(View);
  }

  uninstall() {
    // TODO handle uninstall
    console.log(this.vm);
  }
}

function loadingTop(target: any, propertyKey: string, descriptor: any) {
  const originalFn = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    this.loadingTop = true;
    await originalFn.apply(this, args);
    this.loadingTop = false;
  };
  return descriptor;
}

function loadingBottom(target: any, propertyKey: string, descriptor: any) {
  const originalFn = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    this.loadingBottom = true;
    await originalFn.apply(this, args);
    this.loadingBottom = false;
  };
  return descriptor;
}

export { LoadingMorePlugin, loadingTop, loadingBottom };
