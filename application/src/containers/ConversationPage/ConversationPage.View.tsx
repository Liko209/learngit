import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPage } from 'jui/pattern/ConversationPage';
import { JuiDivider } from 'jui/components/Divider';
import { translate } from 'react-i18next';
import { Header } from './Header';
import { Stream } from './Stream';
import { MessageInput } from '@/containers/MessageInput';
import { JuiDisabledInput } from 'jui/components/DisabledInput';
import { ConversationPageViewProps } from './types';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  render() {
    const { t, groupId, canPost } = this.props;
    if (!groupId) {
      return null;
    }
    return (
      <JuiConversationPage>
        <Header id={groupId} />
        <JuiDivider />
        <Stream groupId={groupId} />
        {canPost ? (
          <MessageInput id={groupId} />
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
