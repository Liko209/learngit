import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { parse } from 'qs';

import ThreeLayout from 'ui-components/organisms/Layout/ThreeLayout';
import LeftRail from './LeftRail';
import { ConversationPage } from './ConversationPage';
import RightRail from './RightRail';

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> {}

interface IStates {
  leftNavWidth: number;
}

class Conversation extends Component<IProps, IStates> {
  constructor(props: IProps) {
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

export default Conversation;
