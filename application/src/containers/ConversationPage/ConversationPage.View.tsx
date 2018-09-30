import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPage, JuiDivider } from 'ui-components';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import { Header } from './Header';
import { Stream } from './Stream';
import { MessageInput } from '@/containers/MessageInput';
import DisabledInput from 'ui-components/DisabledInput';

type ConversationPageProps = {
  canPost: boolean;
  id: number;
  t: TranslationFunction;
};

@observer
class ConversationPage extends Component<ConversationPageProps> {
  render() {
    const { t, id, canPost } = this.props;
    if (!id) {
      return null;
    }
    return (
      <JuiConversationPage>
        <Header id={id} />
        <JuiDivider />
        <Stream groupId={id} />
        {canPost ? (
          <MessageInput id={id} />
        ) : (
          <DisabledInput text={t('disabledText')} />
        )}
      </JuiConversationPage>
    );
  }
}

const ConversationPageView = translate('Conversations')(ConversationPage);

export { ConversationPageView };
