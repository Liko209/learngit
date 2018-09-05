import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import ChatView from 'react-chatview';

import Post from '#/containers/Post';

import PostsPresenter from './PostsPresenter';

function hasScrolled(el, direction = 'vertical') {
  if (direction === 'vertical') {
    return el.scrollHeight > el.clientHeight;
  }
  return el.scrollWidth > el.clientWidth;
}

@withRouter
@observer
class Posts extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.presenter = new PostsPresenter();

    this.loadPosts = this.loadPosts.bind(this);
    this.hasMovePost = this.hasMovePost.bind(this);
    this.getScrollable = this.getScrollable.bind(this);
  }

  componentDidMount() {
    const id  = this.props.id;
    const conversationThread = this.presenter.getConversationThread(id);
    const offset = conversationThread.getSize();
    if (!offset) {
      conversationThread
        .loadPosts()
        .then(() => {
          if (!hasScrolled(this.scrollable)) {
            conversationThread.loadPosts();
          }
        })
        .then(() => {
          conversationThread.markAsRead();
          conversationThread.updateLastGroup();
        });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.presenter.setGlobalStoreSWITCH(true);
      const {
        match: {
          params: { id }
        }
      } = this.props;
      const conversationThread = this.presenter.getConversationThread(id);
      const offset = conversationThread.getSize();
      if (!offset) {
        conversationThread
          .loadPosts()
          .then(() => {
            if (!hasScrolled(this.scrollable)) {
              conversationThread.loadPosts();
            }
          })
          .then(() => {
            conversationThread.markAsRead();
            conversationThread.updateLastGroup();
          })
          .catch(err => console.log(err));
      }
      this.scrollable.scrollTop = this.scrollable.scrollHeight;
    }
  }

  componentWillUnmount() {
    this.scrollable = null;
    this.presenter.dispose();
  }

  getScrollable(scrollable) {
    this.scrollable = scrollable;
  }

  loadPosts() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    const conversationThread = this.presenter.getConversationThread(id);
    return conversationThread.loadPosts();
  }

  hasMovePost() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    const conversationThread = this.presenter.getConversationThread(id);
    return conversationThread.checkHasMore();
  }

  render() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    const store = this.presenter.getStore(id);
    const postIds = store.getIds();
    const { className } = this.props;
    return (
      <ChatView
          flipped
          crollLoadThreshold={100}
          onInfiniteLoad={this.loadPosts}
          shouldTriggerLoad={this.hasMovePost}
          returnScrollable={this.getScrollable}
          className={className}
      >
        {postIds.map(pid => <Post id={pid} key={pid} />)}
      </ChatView>
    );
  }
}

const StyledPosts = styled(Posts)`
  flex: 1;
  overflow: auto;
  padding: 0 25px;
`;

export default StyledPosts;
