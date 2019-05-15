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
import { SettingLeftRailViewProps } from './types';
import {
  JuiLeftRail,
  JuiLeftRailStickyTop,
} from 'jui/pattern/LeftRail/LeftRail';
import styled from 'jui/foundation/styled-components';
import history from '@/history';
import { withTranslation, WithTranslation } from 'react-i18next';
import { toTitleCase } from '@/utils/string';
import { SETTING_ITEM } from '../constants';
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
  onEntryClick = (type: string) => {
    history.push(`/settings/${type}`);
  }

  renderItems() {
    const { t, leftRailItemIds, currentSettingListType, onClick } = this.props;
    return (
      <React.Fragment>
        {leftRailItemIds.map((id, index) => {
          const { testId, type, icon, title } = SETTING_ITEM[id];
          return (
            <JuiListNavItem
              data-name="sub-setting"
              data-test-automation-id={testId}
              selected={type === currentSettingListType}
              classes={{ selected: 'selected' }}
              onClick={() => {
                onClick(id);
                this.onEntryClick(type);
              }}
              key={type}
            >
              <JuiListNavItemIconographyLeft iconSize="small">
                {icon}
              </JuiListNavItemIconographyLeft>
              <JuiListNavItemText>{toTitleCase(t(title))}</JuiListNavItemText>
            </JuiListNavItem>
          );
        })}
      </React.Fragment>
    );
  }

  render() {
    return (
      <JuiLeftRail>
        <JuiLeftRailStickyTop>
          <StyledList component="nav" data-test-automation-id="settingLeftRail">
            {this.renderItems()}
          </StyledList>
        </JuiLeftRailStickyTop>
      </JuiLeftRail>
    );
  }
}

const SettingLeftRailView = withTranslation('translations')(
  SettingLeftRailViewComponent,
);

export { SettingLeftRailView };
