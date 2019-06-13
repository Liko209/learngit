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
import {
  JuiDialogHeader,
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
} from 'jui/components/Dialog/DialogHeader';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { JuiDivider } from 'jui/components/Divider';
import { Dialog } from '@/containers/Dialog';
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

  _handleCLick = async () => {
    const { getShowDialogPermission, getBodyInfo, title } = this.props;
    const showNoteDialog = getShowDialogPermission();
    if (!showNoteDialog) return;
    const bodyInfo = await getBodyInfo();
    if (!bodyInfo) return;
    const { dismiss } = Dialog.simple(
      <>
        <JuiDialogHeader>
          <JuiDialogHeaderTitle>{title}</JuiDialogHeaderTitle>
          <JuiDialogHeaderActions>
            <JuiButtonBar overlapSize={2.5}>
              <JuiIconButton onClick={() => dismiss()} tooltipTitle="Close">
                close
              </JuiIconButton>
            </JuiButtonBar>
          </JuiDialogHeaderActions>
        </JuiDialogHeader>
        <JuiDivider key="divider-filters" />
        <div dangerouslySetInnerHTML={{ __html: bodyInfo }} />
      </>,
      {
        fullScreen: true,
        enableEscapeClose: true,
        onClose: () => dismiss(),
      },
    );
  }

  render() {
    const { title, summary } = this.props;
    return (
      <JuiConversationItemCard
        title={postParser(title, { keyword: this.context.keyword })}
        onClick={this._handleCLick}
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
