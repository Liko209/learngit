/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { GeneralViewProps } from './types';
import { observer } from 'mobx-react';
import { SettingContainer } from '../SettingContainer';
import { SETTING_LIST_TYPE } from '../SettingLeftRail/types';

@observer
class GeneralViewComponent extends Component<GeneralViewProps> {
  renderPlaceHolderItems() {
    return (
      <React.Fragment>
        {Array.from(Array(100), (v, k) => {
          return <p key={k}>GeneralViewComponent - {k}</p>;
        })}
      </React.Fragment>
    );
  }

  render() {
    return (
      <SettingContainer type={SETTING_LIST_TYPE.general}>
        {this.renderPlaceHolderItems()}
      </SettingContainer>
    );
  }
}

export { GeneralViewComponent as GeneralView };
