import { ComponentType } from 'react';
import { withLoading, WithLoadingProps } from 'ui-components';
import { IViewModel } from '@/base/IViewModel';
import { AbstractPlugin } from '@/base/AbstractPlugin';
import { createFunctionWrapDecorator } from './utils';

interface ILoadingViewModel extends IViewModel, WithLoadingProps {}

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

const loading = createFunctionWrapDecorator({
  before(vm: ILoadingViewModel) {
    vm.loading = true;
  },
  after(vm: ILoadingViewModel) {
    vm.loading = false;
  },
});

export { LoadingPlugin, ILoadingViewModel, loading };
