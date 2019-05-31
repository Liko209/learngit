/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:14:04
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import {
  JuiList,
  JuiListNavItem,
  JuiListNavItemIconographyLeft,
  JuiListNavItemText,
} from 'jui/components';
import {
  JuiLeftRail,
  JuiLeftRailStickyTop,
} from 'jui/pattern/LeftRail/LeftRail';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { toTitleCase } from '@/utils/string';
import { SettingLeftRailViewProps } from './types';

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
  render() {
    return (
      <JuiLeftRail>
        <JuiLeftRailStickyTop>
          <StyledList component="nav" data-test-automation-id="settingLeftRail">
            {this._renderNavItems()}
          </StyledList>
        </JuiLeftRailStickyTop>
      </JuiLeftRail>
    );
  }

  private _renderNavItems() {
    const { t, match, pages, currentPage, goToSettingPage } = this.props;

    return pages.map(page => {
      return (
        <JuiListNavItem
          data-name="sub-setting"
          data-test-automation-id={`entry-${page.automationId}`}
          selected={
            (currentPage && page.id === currentPage.id) ||
            page.path === `/${match.params.subPath}`
          }
          classes={{ selected: 'selected' }}
          onClick={() => goToSettingPage(page.id)}
          key={page.id}
        >
          <JuiListNavItemIconographyLeft iconSize="small">
            {page.icon}
          </JuiListNavItemIconographyLeft>
          <JuiListNavItemText>{toTitleCase(t(page.title))}</JuiListNavItemText>
        </JuiListNavItem>
      );
    });
  }
}

const SettingLeftRailView = withTranslation('translations')(
  withRouter(SettingLeftRailViewComponent),
);

export { SettingLeftRailView };
