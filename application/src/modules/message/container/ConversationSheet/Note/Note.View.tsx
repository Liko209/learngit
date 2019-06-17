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
import { withTranslation, WithTranslation } from 'react-i18next';
import NoteIcon from '@material-ui/icons/EventNote';
import { observer } from 'mobx-react';
import {
  postParser,
  HighlightContextInfo,
  SearchHighlightContext,
} from '@/common/postParser';
import { openNoteViewer } from '../../ConversationDetailViewer';
type NoteViewType = NoteViewProps & WithTranslation;

@observer
class NoteViewComponent extends Component<NoteViewType> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;

  _handleClick = async () => {
    const { title, getBodyInfo } = this.props;
    const bodyInfo = await getBodyInfo();
    openNoteViewer(title, bodyInfo);
  }

  render() {
    const { title, summary } = this.props;
    return (
      <JuiConversationItemCard
        title={postParser(title, { keyword: this.context.keyword })}
        onClick={this._handleClick}
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

const NoteView = withTranslation('translations')(NoteViewComponent);

export { NoteView };
