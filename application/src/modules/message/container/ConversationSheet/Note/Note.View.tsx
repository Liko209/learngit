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
import { phoneParserHoc } from '@/modules/common/container/PhoneParser/PhoneParserHoc';

const PhoneNumberHoc = phoneParserHoc(JuiNoteContent);
@observer
class NoteView extends Component<NoteViewProps> {
  render() {
    const { title, summary } = this.props;
    return (
      <JuiConversationItemCard title={title} Icon={<NoteIcon />}>
        <PhoneNumberHoc description={summary}/>
      </JuiConversationItemCard>
    );
  }
}

export { NoteView };
