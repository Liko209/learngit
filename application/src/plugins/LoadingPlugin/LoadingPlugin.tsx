/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:51
 * Copyright © RingCentral. All rights reserved.
 */
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
