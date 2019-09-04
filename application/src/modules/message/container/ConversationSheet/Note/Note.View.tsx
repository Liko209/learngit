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
    const { title, id } = this.props;
    openNoteViewer(title, id);
  };

  render() {
    const { title, summary } = this.props;
    return (
      <JuiConversationItemCard
        title={postParser(title, { keyword: this.context.keyword })}
        onClick={this._handleClick}
        iconColor={['common', 'black']}
        Icon="notes"
      >
        <JuiNoteContent data-test-automation-id="note-body">
          {postParser(summary, {
            keyword: this.context.keyword,
          })}
        </JuiNoteContent>
      </JuiConversationItemCard>
    );
  }
}

const NoteView = withTranslation('translations')(NoteViewComponent);

export { NoteView };
