import { ComponentType } from 'react';
import { withLoading, WithLoadingProps } from 'ui-components';
import { IViewModel } from '@/base/IViewModel';
import { IPlugin } from '@/base/IPlugin';
import { createFunctionWrapDecorator } from '../utils';

interface ILoadingViewModel extends IViewModel, WithLoadingProps {}

class LoadingPlugin implements IPlugin {
  install(vm: IViewModel): void {
    vm.extendProps({ loading: false });
  }

  wrapView(View: ComponentType<any>) {
    return withLoading(View);
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
