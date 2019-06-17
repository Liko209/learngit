/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:24:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
} from 'jui/components/Lists';
import { JuiIconWrapper, JuiNoteIcon } from 'jui/pattern/RightShelf';
import { openNoteViewer } from '../../ConversationDetailViewer';
import { NoteItemProps } from './types';
import { observer } from 'mobx-react';

@observer
class NoteItemView extends Component<NoteItemProps> {
  _handleClick = async () => {
    const { title, getBodyInfo } = this.props;
    const bodyInfo = await getBodyInfo();
    openNoteViewer(title, bodyInfo);
  }
  render() {
    const { disabled, title, subTitle } = this.props;

    return (
      <JuiListItem
        disabled={disabled}
        data-test-automation-id="rightRail-note-item"
      >
        <JuiListItemIcon onClick={this._handleClick}>
          <JuiIconWrapper>
            <JuiNoteIcon />
          </JuiIconWrapper>
        </JuiListItemIcon>
        <JuiListItemText primary={title} secondary={subTitle} />
      </JuiListItem>
    );
  }
}

export { NoteItemView };
