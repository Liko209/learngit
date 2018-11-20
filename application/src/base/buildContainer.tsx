/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { IPlugin } from './IPlugin';
import StoreViewModel from '@/store/ViewModel';
import { computed, action, observable } from 'mobx';

type Plugins = { [key: string]: IPlugin };
type BuildContainerOptions<T> = {
  displayName?: string;
  ViewModel: new (...args: any[]) => StoreViewModel;
  View: ComponentType<any>;
  plugins?: () => Plugins;
};
type TIntrinsticProps = {
  scrollerRef?: any;
};
function buildContainer<P = {}, S = {}, SS = any>({
  View,
  ViewModel,
  plugins,
}: BuildContainerOptions<P>) {
  type Props = P & TIntrinsticProps;
  const ObserverView = observer(View);

  @observer
  class Container extends Component<Props, S, SS> {
    static displayName = View.displayName
      ? `Container(${View.displayName})`
      : 'Container';
    @observable
    vm: StoreViewModel;
    View: ComponentType<any>;
    plugins: Plugins;

    constructor(props: Props) {
      super(props);
      this.plugins = this._createPlugins();
      this.View = this._createView(ObserverView);
      this.vm = this._createViewModel(props);
    }

    componentWillUnmount() {
      this.vm.dispose && this.vm.dispose();
    }

    @action
    componentWillReact() {
      this.vm.getDerivedProps && this.vm.getDerivedProps(this.props || {});
      this.vm.onReceiveProps && this.vm.onReceiveProps(this.props || {});
    }

    render() {
      const View = this.View;
      return <View {...this._viewProps} />;
    }

    private _createPlugins() {
      return plugins ? plugins() : {};
    }

    private _createView(OriginalView: ComponentType<any>) {
      let View = OriginalView;
      _(this.plugins).forEach((plugin: IPlugin) => {
        View = plugin.wrapView(View);
      });
      return View;
    }

    private _createViewModel(props: any = {}) {
      const vm = new ViewModel(props);

      _(this.plugins).forEach((plugin: IPlugin) => {
        plugin.install(vm);
      });

      vm.getDerivedProps && vm.getDerivedProps(props);
      vm.onReceiveProps && vm.onReceiveProps(props);

      return vm;
    }

    @computed
    private get _viewProps() {
      const descriptors = Object.getOwnPropertyDescriptors(this.vm);
      const props: any = {};

      Object.keys(this.props).forEach((key: string) => {
        props[key] = this.props[key];
      });

      Object.keys(descriptors)
        .filter(this._isViewProp)
        .forEach((key: string) => {
          props[key] = this.vm[key];
        });
      return props;
    }

    private _isViewProp(key: string) {
      // - Props start with _ or $ are private
      // - 'verboseMemoryLeak' is add by EventEmitter2
      // - 'props' don't affect View directly, if you want View response 'props',
      //   you need to setup a observable/computed prop in ViewModel.
      return (
        !/^\$|_/.test(key) && key !== 'verboseMemoryLeak' && key !== 'props'
      );
    }
  }

  return Container;
}

export { buildContainer };
