/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-22 10:09:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { UnregisterCallback } from 'history';
import { JuiLeftRail } from 'jui/pattern/LeftRail/LeftRail';

import { LeftRailViewProps } from './types';
import { SectionView } from '../Section';
import { isSectionTabs } from '../utils';
import { Section } from '../types';

@observer
class LeftRailViewComponent extends Component<
  LeftRailViewProps & RouteComponentProps
> {
  @observable
  selectedPath: string;
  private _unListen: UnregisterCallback;

  componentDidMount() {
    const { history } = this.props;
    this.selectedPath = `/${window.location.pathname.split('/').pop()}`;

    this._unListen = history.listen(location => {
      const newSelectedPath = location.pathname.split('/').pop();
      this.selectedPath = `/${newSelectedPath}`;
    });
  }

  componentWillUnmount() {
    this._unListen();
  }

  private _renderSectionNav(sections: Section[]) {
    const { config, updateCurrentUrl } = this.props;
    return (
      <JuiLeftRail>
        {sections.map(({ title, tabs }) => {
          return (
            <SectionView
              updateCurrentUrl={updateCurrentUrl}
              key={title}
              selectedPath={this.selectedPath}
              title={title}
              tabs={tabs}
              rootPath={config.rootPath}
            />
          );
        })}
      </JuiLeftRail>
    );
  }

  render() {
    const { config } = this.props;
    // TODO single item nav
    return isSectionTabs(config)
      ? this._renderSectionNav(config.sections)
      : null;
  }
}

const LeftRailView = withRouter(LeftRailViewComponent);

export { LeftRailView };
