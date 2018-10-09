import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPage, JuiDivider } from 'ui-components';
import { translate } from 'react-i18next';
import { Header } from './Header';
import { Stream } from './Stream';
import { MessageInput } from './MessageInput';
import DisabledInput from 'ui-components/DisabledInput';
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
            <DisabledInput text={t('disabledText')} />
          )}
      </JuiConversationPage>
    );
  }
}

const ConversationPageView = translate('Conversations')(
  ConversationPageViewComponent,
);

export { ConversationPageView };
