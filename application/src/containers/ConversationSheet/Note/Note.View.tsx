/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:54:47
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { NoteViewProps } from './types';
import {
  JuiConversationItemCard,
  JuiNoteContent,
} from 'jui/pattern/ConversationItemCard';
import NoteIcon from '@material-ui/icons/EventNote';
import { observer } from 'mobx-react';

@observer
class NoteView extends Component<NoteViewProps> {
  render() {
    const { title, summary } = this.props;
    return (
      <JuiConversationItemCard title={title} Icon={<NoteIcon />}>
        <JuiNoteContent>{summary}</JuiNoteContent>
      </JuiConversationItemCard>
    );
  }
}

export { NoteView };
