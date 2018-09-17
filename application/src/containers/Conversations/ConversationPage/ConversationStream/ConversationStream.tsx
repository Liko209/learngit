import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ConversationThreadsManager from './ConversationStreamManager';
import ConversationCard from '@/containers/Conversations/ConversationPage/ConversationCard';
import { JuiChatView } from 'ui-components';
import { observable } from 'mobx';
import _ from 'lodash';

interface IProps {
  groupId: number;
}

@observer
class ConversationStream extends Component<IProps> {
  public manager: ConversationThreadsManager = new ConversationThreadsManager();
  public scrollable: any = {};
  @observable
  hasMore: boolean = true;
  constructor(props: IProps) {
    super(props);
    this.scrollable = {};
  }
  componentDidMount() {
    this.afterRendered();
  }

  componentDidUpdate(prevProps: IProps) {
    this.afterRendered();
  }

  afterRendered() {
    this.conversationThread.markAsRead();
    this.conversationThread.updateLastGroup();
  }
  get conversationThread() {
    const id = this.props.groupId;
    return this.manager.getConversationThread(id);
  }

  componentWillUnmount() {
    const groupId = this.props.groupId;
    this.manager.dispose(groupId);
  }

  loadPosts = async () => {
    try {
      await this.conversationThread.loadPosts();
    } catch (err) {
      console.info(err);
    }
  }

  hasMorePost = () => {
    const groupId = this.props.groupId;
    const conversationThread = this.manager.getConversationThread(groupId);
    return conversationThread.checkHasMore();
  }

  render() {
    const id = this.props.groupId;
    const vm = this.manager.getConversationThread(id);
    if (!vm) {
      return null;
    }
    const postIds = _(vm.items)
      .map('id')
      .value();
    return (
      <JuiChatView
        flipped={true}
        scrollLoadThreshold={100}
        onInfiniteLoad={this.loadPosts}
        shouldTriggerLoad={this.hasMorePost}
      >
        {postIds.reverse().map((id: number) => (
          <ConversationCard id={id} key={id} />
        ))}
      </JuiChatView>
    );
  }
}
export { ConversationStream };
export default ConversationStream;
