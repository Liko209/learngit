/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { MessagesViewProps } from './types';
import { observer } from 'mobx-react';
import { SETTING_LIST_TYPE } from '../SettingLeftRail/types';
import { SettingContainer } from '../SettingContainer';

@observer
class MessagesViewComponent extends Component<MessagesViewProps> {
  renderPlaceHolderItems() {
    return (
      <React.Fragment>
        {Array.from(Array(100), (v, k) => {
          return <p key={k}>MessagesViewComponent - {k}</p>;
        })}
      </React.Fragment>
    );
  }

  render() {
    return (
      <SettingContainer type={SETTING_LIST_TYPE.MESSAGES}>
        {this.renderPlaceHolderItems()}
      </SettingContainer>
    );
  }
}

export { MessagesViewComponent as MessagesView };
