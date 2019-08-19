import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { container } from 'framework/ioc';
import { AppStore } from '../../store';
import { DocumentTitle } from '@/modules/common/container/DocumentTitle';

/**
 * Update document.title umi
 */
@observer
class Title extends Component {
  private _appStore = container.get(AppStore);

  render() {
    const { name, umi } = this._appStore;
    const prefix = umi ? `(${umi}) ` : '';
    return <DocumentTitle>{prefix + name}</DocumentTitle>;
  }
}

export { Title };
