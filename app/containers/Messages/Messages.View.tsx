import React, { Component } from 'react';
import { parse } from 'qs';
import ThreeLayout from 'jui/foundation/Layout/ThreeLayout';
import { ConversationPage } from '@/containers/ConversationPage';
import { LeftRail } from '@/containers/LeftRail';
import { RightRail } from '@/containers/RightRail';

import { MessagesViewProps, MessagesViewStates } from './types';

class MessagesView extends Component<MessagesViewProps, MessagesViewStates> {
  constructor(props: MessagesViewProps) {
    super(props);
    this.state = { leftNavWidth: 0 };
  }

  componentDidMount() {
    const leftnav = document.getElementById('leftnav');
    let leftNavWidth = 0;
    if (leftnav) {
      leftNavWidth = leftnav.getBoundingClientRect().width;
    }
    if (leftNavWidth > 0) {
      this.setState({ leftNavWidth });
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.props.location.search !== prevProps.location.search) {
      const parsed = parse(this.props.location.search, {
        ignoreQueryPrefix: true,
      });
      let leftNavWidth = 0;
      if (parsed.leftnav === 'true') {
        leftNavWidth = 200;
      } else if (parsed.leftnav === 'false') {
        leftNavWidth = 72;
      }
      if (leftNavWidth > 0) {
        this.setState({ leftNavWidth });
      }
    }
  }

  render() {
    const { leftNavWidth } = this.state;
    return (
      <ThreeLayout tag="conversation" leftNavWidth={leftNavWidth}>
        <LeftRail />
        <ConversationPage />
        <RightRail />
      </ThreeLayout>
    );
  }
}

export { MessagesView };
