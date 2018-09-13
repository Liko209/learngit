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

function buildContainer<T>({
  View,
  ViewModel,
  plugins = [],
}: BuildContainerOptions<T>) {
  @observer
  class Container extends Component<T> {
    @observable
    vm: IViewModel;
    View = View;

    constructor(props: any) {
      super(props);
      this.vm = new ViewModel(this.props);
      plugins.forEach((plugin: IPlugin) => {
        plugin.install(this.vm);
        this.View = plugin.wrapView(this.View);
      });
    }

    render() {
      const View = this.View;
      return <View {...this.vm} />;
    }
  }

  return Container;
}

export { buildContainer };
