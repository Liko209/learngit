/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  JuiList,
  JuiListNavItem,
  JuiListNavItemText,
  JuiListNavItemIconographyLeft,
} from 'jui/components';
import { SettingLeftRailViewProps, SETTING_LIST_TYPE } from './types';
import {
  JuiLeftRail,
  JuiLeftRailStickyTop,
} from 'jui/pattern/LeftRail/LeftRail';
import styled from 'jui/foundation/styled-components';
import history from '@/history';
import { withTranslation, WithTranslation } from 'react-i18next';
import { toTitleCase } from '@/utils/string';
import { observer } from 'mobx-react';
import { spacing } from 'jui/foundation/utils';

const StyledList = styled(JuiList)`
  && {
    padding-top: ${spacing(4.25)};
    padding-bottom: 0;
    width: 100%;
  }
`;

@observer
class SettingLeftRailViewComponent extends Component<
  SettingLeftRailViewProps & WithTranslation
> {
  onEntryClick = (type: SETTING_LIST_TYPE) => {
    history.push(`/settings/${type}`);
  }

  renderItems() {
    const { t, entries, currentSettingListType } = this.props;
    return (
      <React.Fragment>
        {entries.map((entry, index) => (
          <JuiListNavItem
            data-test-automation-id={entry.testId}
            selected={entry.type === currentSettingListType}
            classes={{ selected: 'selected' }}
            onClick={() => {
              this.onEntryClick(entry.type);
            }}
            key={entry.type}
          >
            <JuiListNavItemIconographyLeft iconSize="small">
              {entry.icon}
            </JuiListNavItemIconographyLeft>
            <JuiListNavItemText>
              {toTitleCase(t(entry.title))}
            </JuiListNavItemText>
          </JuiListNavItem>
        ))}
      </React.Fragment>
    );
  }

  render() {
    return (
      <JuiLeftRail>
        <JuiLeftRailStickyTop>
          <StyledList component="nav">{this.renderItems()}</StyledList>
        </JuiLeftRailStickyTop>
      </JuiLeftRail>
    );
  }
}

const SettingLeftRailView = withTranslation('translations')(
  SettingLeftRailViewComponent,
);

export { SettingLeftRailView };
