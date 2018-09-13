import { ComponentType } from 'react';
import { withLoading, WithLoadingProps } from 'ui-components';
import { IViewModel } from '@/base/IViewModel';
import { AbstractPlugin } from '@/base/AbstractPlugin';

interface ILoadableViewModel extends IViewModel, WithLoadingProps {}

class LoadingPlugin extends AbstractPlugin {
  afterInstall(): void {
    this.extendViewModel({ loading: false });
  }

  wrapView(View: ComponentType<any>) {
    return withLoading(View);
  }

  uninstall() {
    // TODO handle uninstall
    console.log(this.vm);
  }
}

function loading(target: any, propertyKey: string, descriptor: any) {
  const originalFn = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    this.loading = true;
    await originalFn.apply(this, args);
    this.loading = false;
  };
  return descriptor;
}

export { LoadingPlugin, ILoadableViewModel, loading };
