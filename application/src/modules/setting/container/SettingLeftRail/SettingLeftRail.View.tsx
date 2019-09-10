/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:14:04
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { UnregisterCallback } from 'history';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import {
  JuiList,
  JuiListNavItem,
  JuiListNavItemIconographyLeft,
  JuiListNavItemText,
} from 'jui/components/Lists';
import { JuiLeftRail } from 'jui/pattern/LeftRail/LeftRail';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { SettingLeftRailViewProps } from './types';
import { observable } from 'mobx';

// TODO move to jui
const StyledList = styled(JuiList)`
  && {
    padding-top: ${spacing(4.25)};
    padding-bottom: 0;
    width: 100%;
  }
`;

type Props = SettingLeftRailViewProps &
  WithTranslation &
  RouteComponentProps<{ subPath: string }>;

@observer
class SettingLeftRailViewComponent extends Component<Props> {
  @observable
  selectedPath: string = `/${window.location.pathname.split('/').pop()}`;

  private _unListen: UnregisterCallback;

  componentDidMount() {
    const { history } = this.props;
    this._unListen = history.listen(location => {
      const newSelectedPath = location.pathname.split('/').pop();
      if (this.selectedPath !== newSelectedPath) {
        this.selectedPath = `/${newSelectedPath}`;
      }
    });
  }

  componentWillUnmount() {
    this._unListen();
  }

  private _renderNavItems() {
    const { t, pages, goToSettingPage } = this.props;

    return pages.map(page => (
      <JuiListNavItem
        data-name="sub-setting"
        data-test-automation-id={`entry-${page.automationId}`}
        selected={page.path === this.selectedPath}
        classes={{ selected: 'selected' }}
        onClick={() => goToSettingPage(page.id)}
        key={page.id}
      >
        <JuiListNavItemIconographyLeft iconSize="small">
          {page.icon}
        </JuiListNavItemIconographyLeft>
        <JuiListNavItemText>{t(page.title)}</JuiListNavItemText>
      </JuiListNavItem>
    ));
  }
  render() {
    return (
      <JuiLeftRail>
        <StyledList component="nav" data-test-automation-id="settingLeftRail">
          {this._renderNavItems()}
        </StyledList>
      </JuiLeftRail>
    );
  }
}

const SettingLeftRailView = withTranslation('translations')(
  withRouter(SettingLeftRailViewComponent),
);

export { SettingLeftRailView };
