/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:25
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ComponentType } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import {
  JuiConversationPageHeader,
  JuiConversationPageHeaderSubtitle,
} from 'jui/pattern/ConversationPageHeader';
import { JuiButtonBar } from 'jui/components/Buttons';
import { Favorite, Privacy, Member, Mute } from '@/containers/common';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CONVERSATION_TYPES } from '@/constants';
import { IMessageStore } from '@/modules/message/interface';
import { Menu } from './Menu';

type HeaderProps = {
  title: string;
  analysisSource: string;
  colonsEmoji: string;
  statusPlainText: string;
  type: CONVERSATION_TYPES;
  actions: {
    name: string;
    iconName: string;
    tooltip: string;
  }[];
  groupId: number;
} & WithTranslation;

@observer
class Header extends Component<HeaderProps, { awake: boolean }> {
  @IMessageStore private _messageStore: IMessageStore;

  constructor(props: HeaderProps) {
    super(props);
  }

  private _renderMenu = () => {
    const { groupId } = this.props;
    return <Menu id={groupId} key={groupId} />;
  };

  @computed
  private get _ActionButtons() {
    const { groupId } = this.props;

    const { conversationHeaderExtensions } = this._messageStore;
    const actionButtons = conversationHeaderExtensions.map(
      (Comp: ComponentType<{ groupId: number; analysisSource: string }>) => (
        <Comp
          key={`ACTION_${groupId}${Comp.displayName}`}
          groupId={groupId}
          analysisSource="conversationHeader"
        />
      ),
    );

    actionButtons.push(this._renderMenu());

    return <JuiButtonBar overlapSize={1}>{actionButtons}</JuiButtonBar>;
  }

  private _SubTitle() {
    const { type, groupId, analysisSource } = this.props;

    return (
      <JuiConversationPageHeaderSubtitle>
        <JuiButtonBar overlapSize={2}>
          <Favorite
            key={groupId}
            id={groupId}
            size="medium"
            dataTrackingProps={{
              source: 'conversationHeader: another entry',
              conversationType: analysisSource,
            }}
          />
          {type === CONVERSATION_TYPES.TEAM ? (
            <Privacy
              id={groupId}
              size="medium"
              analysisSource="conversationHeader"
            />
          ) : null}
          <Member id={groupId} />
          <Mute groupId={groupId} />
        </JuiButtonBar>
      </JuiConversationPageHeaderSubtitle>
    );
  }

  render() {
    const { title, colonsEmoji, statusPlainText } = this.props;

    return (
      <JuiConversationPageHeader
        data-test-automation-id="conversation-page-header"
        title={title}
        colonsEmoji={colonsEmoji}
        statusPlainText={statusPlainText}
        SubTitle={this._SubTitle()}
        Right={this._ActionButtons}
      />
    );
  }
}

const HeaderView = withTranslation('translations')(Header);

export { HeaderView, HeaderProps };
