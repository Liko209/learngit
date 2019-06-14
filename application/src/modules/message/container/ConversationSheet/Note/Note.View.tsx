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
import {
  postParser,
  HighlightContextInfo,
  SearchHighlightContext,
} from '@/common/postParser';

@observer
class NoteView extends Component<NoteViewProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;
  render() {
    const { title, summary } = this.props;
    return (
      <JuiConversationItemCard
        title={postParser(title, { keyword: this.context.keyword })}
        Icon={<NoteIcon />}
      >
        <JuiNoteContent data-test-automation-id="note-body">
          {postParser(summary, {
            keyword: this.context.keyword,
            phoneNumber: true,
          })}
        </JuiNoteContent>
      </JuiConversationItemCard>
    );
  }
}

export { NoteView };
