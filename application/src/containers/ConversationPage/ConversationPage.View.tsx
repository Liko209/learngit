import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { observer } from 'mobx-react';
import {
  JuiStreamWrapper,
  JuiConversationPage,
} from 'jui/pattern/ConversationPage';
import { JuiDivider } from 'jui/components/Divider';
import { JuiDisabledInput } from 'jui/pattern/DisabledInput';
import { TScroller } from 'jui/hoc/withScroller';
import { Header } from './Header';
import { Stream } from './Stream';
import { MessageInput } from './MessageInput';
import { ConversationPageViewProps } from './types';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  private _viewRefs: {
    scroller?: TScroller;
  } = {};

  scroller: React.Component & {
    scrollToRow: (n: number) => void;
  };

  sendHandler = () => {
    const scroller = this._viewRefs.scroller;
    scroller && scroller.scrollToRow(-1);
  }

  render() {
    const { t, groupId, canPost } = this.props;

    return groupId ? (
      <JuiConversationPage
        className="conversation-page"
        data-group-id={groupId}
      >
        <Header id={groupId} />
        <JuiDivider />
        <JuiStreamWrapper>
          <Stream groupId={groupId} viewRefs={this._viewRefs} />
          <div id="jumpToFirstUnreadButtonRoot" />
        </JuiStreamWrapper>
        {canPost ? (
          <MessageInput id={groupId} onPost={this.sendHandler} />
        ) : (
          <JuiDisabledInput text={t('disabledText')} />
        )}
      </JuiConversationPage>
    ) : null;
  }
}

const ConversationPageView = translate('Conversations')(
  ConversationPageViewComponent,
);

export { ConversationPageView };
