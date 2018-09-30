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
import { IViewModel } from './IViewModel';

type BuildContainerOptions<T> = {
  ViewModel: new (...args: any[]) => IViewModel;
  View: ComponentType<any>;
  plugins?: IPlugin[];
};

function buildContainer<P = {}, S = {}, SS = any>({
  View,
  ViewModel,
  plugins = [],
}: BuildContainerOptions<P>) {
  @observer
  class Container extends Component<P, S, SS> {
    @observable
    vm: IViewModel;
    View = View;

    constructor(props: P) {
      super(props);
      this.vm = new ViewModel();
      plugins.forEach((plugin: IPlugin) => {
        plugin.install(this.vm);
        this.View = plugin.wrapView(this.View);
      });
      this.vm.onReceiveProps && this.vm.onReceiveProps(props);
    }

    componentWillUnmount() {
      this.vm.dispose && this.vm.dispose();
    }

    componentDidUpdate(props: P) {
      this.vm.onReceiveProps && this.vm.onReceiveProps(props);
    }

    render() {
      const View = this.View;
      return <View {...this._vmProps} />;
    }

    private get _vmProps() {
      const props: any = {};
      for (const key in this.vm) {
        if (!/^\$|_/.test(key)) {
          // Not start with _ or $
          props[key] = this.vm[key];
        }
      }
      return props;
    }
  }

  return Container;
}

export { buildContainer };
