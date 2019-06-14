/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:54:47
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { NoteViewProps } from './types';
import {
  JuiConversationItemCard,
  JuiNoteContent,
  JuiNoteIframe,
} from 'jui/pattern/ConversationItemCard';
import {
  JuiDialogHeader,
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
} from 'jui/components/Dialog/DialogHeader';
import { observable, reaction } from 'mobx';
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
  @observable private _ref: RefObject<any> = createRef();
  context: HighlightContextInfo;
  refReaction: any;

  constructor(props: NoteViewProps) {
    super(props);
    this.refReaction = reaction(() => this._ref.current, this._iframeOnLoad);
  }

  componentWillUnmount() {
    this.refReaction();
  }

  _iframeOnLoad = async (iframe: HTMLIFrameElement) => {
    if (!iframe) return;
    const iframeContentDocument = iframe.contentDocument;
    if (!iframeContentDocument) return;
    const { getBodyInfo } = this.props;
    const bodyInfo = await getBodyInfo();
    iframeContentDocument.open();
    iframeContentDocument.write(bodyInfo as any);
    iframeContentDocument.close();
  }

  _handleClick = async () => {
    const { getShowDialogPermission, title } = this.props;
    const showNoteDialog = getShowDialogPermission();
    if (!showNoteDialog) return;
    const { dismiss } = Dialog.simple(
      <>
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
        </>
        <JuiNoteIframe ref={this._ref} />
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

export { NoteView };
