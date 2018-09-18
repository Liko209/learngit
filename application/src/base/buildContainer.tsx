/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
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
      this.vm = new ViewModel(this.props);
      plugins.forEach((plugin: IPlugin) => {
        plugin.install(this.vm);
        this.View = plugin.wrapView(this.View);
      });
      this.vm.ready && this.vm.ready();
    }

    componentDidMount() {
      this.vm.componentDidMount &&
        this.vm.componentDidMount.apply(this.vm, arguments);
    }

    getSnapshotBeforeUpdate(
      prevProps: Readonly<P>,
      prevState: Readonly<S>,
    ): SS | null {
      return (
        this.vm.getSnapshotBeforeUpdate &&
        this.vm.getSnapshotBeforeUpdate.apply(this.vm, arguments)
      );
    }

    componentWillUnmount() {
      this.vm.componentWillUnmount &&
        this.vm.componentWillUnmount.apply(this.vm, arguments);
    }

    componentDidUpdate() {
      this.vm.componentDidUpdate &&
        this.vm.componentDidUpdate.apply(this.vm, arguments);
    }

    componentDidCatch() {
      this.vm.componentDidCatch &&
        this.vm.componentDidCatch.apply(this.vm, arguments);
    }

    render() {
      const View = this.View;
      return <View {...this.vm} />;
    }
  }

  return Container;
}

export { buildContainer };
