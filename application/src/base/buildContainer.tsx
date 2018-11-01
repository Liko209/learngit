/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { IPlugin } from './IPlugin';
import StoreViewModel from '@/store/ViewModel';

type BuildContainerOptions<T> = {
  ViewModel: new (...args: any[]) => StoreViewModel;
  View: ComponentType<any>;
  plugins?: IPlugin[];
};
type TPrivateProps = {
  viewRef: (ref: any) => void;
};
function buildContainer<P = {}, S = {}, SS = any>({
  View,
  ViewModel,
  plugins = [],
}: BuildContainerOptions<P>) {
  type Props = P & Partial<TPrivateProps>;
  @observer
  class Container extends Component<Props, S, SS> {
    @observable
    vm: StoreViewModel;
    View = View;

    constructor(props: Props) {
      super(props);
      this.vm = new ViewModel(props);
      plugins.forEach((plugin: IPlugin) => {
        plugin.install(this.vm);
        this.View = plugin.wrapView(this.View);
      });
      this.vm.getDerivedProps && this.vm.getDerivedProps(this.props);
      this.vm.onReceiveProps && this.vm.onReceiveProps(props);
    }

    componentWillUnmount() {
      this.vm.dispose && this.vm.dispose();
    }

    componentDidUpdate() {
      this.vm.getDerivedProps && this.vm.getDerivedProps(this.props);
      this.vm.onReceiveProps && this.vm.onReceiveProps(this.props);
    }

    render() {
      const View = this.View;
      return <View {...this._viewProps} ref={this.props.viewRef} />;
    }

    private get _viewProps() {
      const descriptors = Object.getOwnPropertyDescriptors(this.vm);
      const props: any = {};
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
