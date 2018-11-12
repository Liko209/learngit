import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPage } from 'jui/pattern/ConversationPage';
import { translate } from 'react-i18next';
import { Header } from './Header';
import { Stream } from './Stream';
import { MessageInput } from './MessageInput';
import { JuiDisabledInput } from 'jui/pattern/DisabledInput';
import { ConversationPageViewProps } from './types';
import { TScroller } from 'jui/hoc/withScroller';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  private _viewRefs: {
    scroller?: TScroller;
  } = {};

  sendHandler = () => {
    const scroller = this._viewRefs.scroller;
    scroller && scroller.scrollToRow(-1);
  }

  componentDidUpdate(prevProps: ConversationPageViewProps) {
    if (this.props.groupId !== prevProps.groupId) {
      const scroller = this._viewRefs.scroller;
      scroller && scroller.scrollToRow(-1);
    }
  }

  render() {
    const { t, groupId, canPost } = this.props;

    return groupId ? (
      <JuiConversationPage
        className="conversation-page"
        data-group-id={groupId}
      >
        <Header id={groupId} />
        <Stream groupId={groupId} viewRefs={this._viewRefs} />
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
