/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ConversationCard } from '@/containers/ConversationCard';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { toTitleCase } from '@/utils';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { StreamViewProps, StreamItem, StreamItemType } from './types';

type Props = WithNamespaces & StreamViewProps;

class StreamViewComponent extends Component<Props> {
  private _listRef: React.RefObject<HTMLElement> = React.createRef();

  async componentDidMount() {
    window.addEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.blurHandler);
    // Scroller's on componentDidMount was called earlier than stream itself
    this.props.plugins.loadingMorePlugin.onListMounted(this._listRef);
    await this.props.loadInitialPosts();
    this.props.plugins.loadingMorePlugin.scrollToRow(-1);
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.groupId !== this.props.groupId) {
      await this.props.loadInitialPosts();
      this.props.plugins.loadingMorePlugin.scrollToRow(-1);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.blurHandler);
  }

  private _renderStreamItem(streamItem: StreamItem) {
    const { t } = this.props;

    switch (streamItem.type) {
      case StreamItemType.POST:
        return (
          <ConversationCard id={streamItem.value} key={streamItem.value} />
        );
      case StreamItemType.NEW_MSG_SEPARATOR:
        return (
          <TimeNodeDivider
            key={streamItem.value}
            value={toTitleCase(t('newMessage_plural'))}
          />
        );
      case StreamItemType.DATE_SEPARATOR:
        return (
          <TimeNodeDivider key={streamItem.value} value={streamItem.value} />
        );
      default:
        return null;
    }
  }

  render() {
    const { items, groupId, hasMore } = this.props;
    return (
      <JuiStream>
        {hasMore ? null : <ConversationInitialPost id={groupId} />}
        <section ref={this._listRef}>
          {items.map(item => this._renderStreamItem(item))}
        </section>
      </JuiStream>
    );
  }

  focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
  }

  blurHandler = () => {
    const { enableNewMessageSeparatorHandler } = this.props;
    enableNewMessageSeparatorHandler();
  }
}

const StreamView = translate('Conversations')(StreamViewComponent);

export { StreamView };
