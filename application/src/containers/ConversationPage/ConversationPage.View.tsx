import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPage } from 'jui/pattern/ConversationPage';
import { JuiDivider } from 'jui/components/Divider';
import { translate } from 'react-i18next';
import { Header } from './Header';
import { Stream } from './Stream';
import { MessageInput } from './MessageInput';
import { JuiDisabledInput } from 'jui/pattern/DisabledInput';
import { ConversationPageViewProps } from './types';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  stream: React.Component & {
    scrollToRow: (n: number) => void;
  };

  setStreamRef = (ref: any) => {
    this.stream = ref;
  }

  sendHandler = () => {
    this.stream.scrollToRow(-1);
  }

  render() {
    const { t, groupId, canPost } = this.props;
    return (
      <JuiConversationPage
        className="conversation-page"
        data-group-id={groupId}
      >
        <Header id={groupId} />
        <JuiDivider />
        <Stream groupId={groupId} viewRef={this.setStreamRef} />
        {canPost ? (
          <MessageInput id={groupId} onPost={this.sendHandler} />
        ) : (
          <JuiDisabledInput text={t('disabledText')} />
        )}
      </JuiConversationPage>
    );
  }
}

const ConversationPageView = translate('Conversations')(
  ConversationPageViewComponent,
);

export { ConversationPageView };
