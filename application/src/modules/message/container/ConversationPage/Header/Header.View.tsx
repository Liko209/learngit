/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:25
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ComponentType } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { container } from 'framework';
import {
  JuiConversationPageHeader,
  JuiConversationPageHeaderSubtitle,
} from 'jui/pattern/ConversationPageHeader';
import { JuiButtonBar } from 'jui/components/Buttons';
import { Favorite, Privacy, Member } from '@/containers/common';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CONVERSATION_TYPES } from '@/constants';
import { MessageStore } from '@/modules/message/store';
import { Menu } from './Menu';

type HeaderProps = {
  title: string;
  analysisSource: string;

  type: CONVERSATION_TYPES;
  actions: {
    name: string;
    iconName: string;
    tooltip: string;
  }[];
  customStatus: string | null;
  groupId: number;
} & WithTranslation;

@observer
class Header extends Component<HeaderProps, { awake: boolean }> {
  private _messageStore: MessageStore = container.get(MessageStore);

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      awake: false,
    };
    this._onHover = this._onHover.bind(this);
    this._onUnhover = this._onUnhover.bind(this);
  }

  private _renderMenu = () => {
    const { groupId } = this.props;
    return <Menu id={groupId} key={groupId} />;
  }

  @computed
  private get _ActionButtons() {
    const { groupId, analysisSource } = this.props;

    const { conversationHeaderExtensions } = this._messageStore;
    const actionButtons = conversationHeaderExtensions.map(
      (
        Comp: ComponentType<{ groupId: number; analysisSource: string }>,
        i: number,
      ) => (
        <Comp
          key={`ACTION_${i}`}
          groupId={groupId}
          analysisSource={analysisSource}
        />
      ),
    );

    actionButtons.push(this._renderMenu());

    return <JuiButtonBar overlapSize={1}>{actionButtons}</JuiButtonBar>;
  }

  private _SubTitle() {
    const { type, groupId } = this.props;

    return (
      <JuiConversationPageHeaderSubtitle>
        <JuiButtonBar overlapSize={2}>
          {type === CONVERSATION_TYPES.TEAM ? (
            <Privacy id={groupId} size="medium" />
          ) : null}
          <Favorite id={groupId} size="medium" />
          <Member id={groupId} />
        </JuiButtonBar>
      </JuiConversationPageHeaderSubtitle>
    );
  }

  private _onHover() {
    this.setState({
      awake: true,
    });
  }

  private _onUnhover() {
    this.setState({
      awake: false,
    });
  }

  render() {
    const { title, customStatus } = this.props;

    return (
      <JuiConversationPageHeader
        data-test-automation-id="conversation-page-header"
        title={title}
        status={customStatus}
        SubTitle={this._SubTitle()}
        Right={this._ActionButtons}
        onMouseEnter={this._onHover}
        onMouseLeave={this._onUnhover}
      />
    );
  }
}

const HeaderView = withTranslation('translations')(Header);

export { HeaderView, HeaderProps };
