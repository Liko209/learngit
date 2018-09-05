import React, { Component } from 'react';

import ChatView from 'react-chatview';
import styled from 'styled-components';
interface IProps {
  onInfiniteLoad: () => any;
  shouldTriggerLoad: () => boolean;
  flipped: boolean;
  scrollLoadThreshold: number;
  returnScrollable?: (el: any) => void;
  reversed?: boolean;
}

const Chatview = styled<IProps>(ChatView)`
  height:100%;
  width:100%;
`;

function hasScrolled(el: any, direction = 'vertical') {
  if (!el) {
    return;
  }
  if (direction === 'vertical') {
    return el.scrollHeight > el.clientHeight;
  }
  return el.scrollWidth > el.clientWidth;
}

class JuiChatView extends Component<IProps>{
  public scrollable: any;
  public Placeholder: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  async componentDidMount() {
    return this.afterRendered();
  }

  async componentDidUpdate(prevProps: IProps) {
    return this.afterRendered();
  }

  async afterRendered() {
    this.attachToBottom();
    if (this.shouldTriggerLoad()) {
      await this.props.onInfiniteLoad();
    }
  }

  shouldTriggerLoad() {
    return !hasScrolled(this.scrollable) && this.props.shouldTriggerLoad();
  }

  get atBottom() {
    return this.scrollable.scrollTop === this.scrollable.scrollHeight - this.scrollable.clientHeight;
  }

  attachToBottom() {
    if (this.atBottom) {
      this.scrollable.scrollTop = this.scrollable.scrollHeight;
    }
  }

  getScrollable = (scrollable: any) => {
    this.scrollable = scrollable;
  }

  componentWillUnmount() {
    return this.scrollable = null;
  }

  render() {
    return (
      <Chatview {...this.props} returnScrollable={this.getScrollable} />
    );
  }
}

export { JuiChatView };
export default JuiChatView;
