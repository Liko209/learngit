/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 19:28:25
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter, Switch, Route } from 'react-router';
import {
  JuiResponsiveLayout,
  withResponsive,
  VISUAL_MODE,
} from 'jui/foundation/Layout/Responsive';

import { isSectionTabs } from '../utils';
import { Section, Tab } from '../types';
import { LayoutViewProps } from './types';
import { LeftRailView } from '../LeftRail';
import { ListMain } from '../ListMain';

const LeftRailResponsive = withResponsive(LeftRailView, {
  maxWidth: 360,
  minWidth: 200,
  defaultWidth: 268,
  visualMode: VISUAL_MODE.AUTOMATIC,
  enable: {
    right: true,
  },
  priority: 1,
});

const SwitchResponsive = withResponsive(Switch, {
  minWidth: 400,
  priority: 2,
});

@observer
class ListLayoutViewComponent extends Component<LayoutViewProps> {
  private _renderRoute(tab: Tab) {
    const { config } = this.props;
    const {
      path,
      Cell,
      automationID,
      empty,
      filter,
      title,
      createHandler,
      minRowHeight,
      onShowDataTrackingKey,
    } = tab;
    const subPath = `${config.rootPath}${path}`;

    return (
      <Route
        path={subPath}
        key={subPath}
        render={() => (
          <ListMain
            filter={filter}
            title={title}
            empty={empty}
            automationID={automationID}
            Cell={Cell}
            minRowHeight={minRowHeight}
            createHandler={createHandler}
            onShowDataTrackingKey={onShowDataTrackingKey}
          />
        )}
      />
    );
  }

  private _renderSectionNav(sections: Section[]) {
    return sections.map(({ tabs }) =>
      tabs.map((tab: Tab) => this._renderRoute(tab)),
    );
  }

  private _renderSingleNav(tabs: Tab[]) {
    return tabs.map((tab: Tab) => this._renderRoute(tab));
  }

  render() {
    const { config, updateCurrentUrl } = this.props;

    return (
      <JuiResponsiveLayout>
        <LeftRailResponsive
          updateCurrentUrl={updateCurrentUrl}
          config={config}
        />
        <SwitchResponsive>
          {isSectionTabs(config)
            ? this._renderSectionNav(config.sections)
            : this._renderSingleNav(config.tabs)}
        </SwitchResponsive>
      </JuiResponsiveLayout>
    );
  }
}

const ListLayout = withRouter(ListLayoutViewComponent);

export { ListLayout };
