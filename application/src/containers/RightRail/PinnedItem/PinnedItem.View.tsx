/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:32
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { PinnedItemViewProps } from './types';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
} from 'jui/components/Lists';
import { JuiIconWrapper, JuiNoteIcon } from 'jui/pattern/RightShelf';

class PinnedItemView extends Component<PinnedItemViewProps> {
  render() {
    return (
      <JuiListItem>
        <JuiListItemIcon>
          <JuiIconWrapper>
            <JuiNoteIcon />
          </JuiIconWrapper>
        </JuiListItemIcon>
        <JuiListItemText primary="" secondary="" />
      </JuiListItem>
    );
  }
}

export { PinnedItemView };
