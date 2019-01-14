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
import { JuiThumbnail } from 'jui/components/Thumbnail';
import { NoteItemProps } from './types';

class NoteItemView extends Component<NoteItemProps> {
  render() {
    const { disabled, title, subTitle } = this.props;

    return (
      <JuiListItem disabled={disabled}>
        <JuiListItemIcon>
          <JuiThumbnail />
        </JuiListItemIcon>
        <JuiListItemText primary={title} secondary={subTitle} />
      </JuiListItem>
    );
  }
}

export { NoteItemView };
