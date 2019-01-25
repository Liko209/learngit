/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:51
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { withLoading, WithLoadingProps } from 'jui/hoc';
import { IViewModel } from '@/base/IViewModel';
import { IPlugin } from '@/base/IPlugin';
import { createLoadingStateDecorator } from '../utils';

interface ILoadingViewModel extends IViewModel, WithLoadingProps {}

type LoadingPluginOptions = {
  CustomizedLoading?: ComponentType<any>;
};

class LoadingPlugin implements IPlugin {
  _options: LoadingPluginOptions;
  constructor(options?: LoadingPluginOptions) {
    this._options = options || {};
  }

  install(vm: IViewModel): void {
    vm.extendProps({ loading: false });
  }

  wrapView(View: ComponentType<any>) {
    return withLoading(View, this._options.CustomizedLoading);
  }
}
const loading = createLoadingStateDecorator('loading');

export { LoadingPlugin, LoadingPluginOptions, ILoadingViewModel, loading };
