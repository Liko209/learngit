/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 16:35:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ConversationCard } from '@/containers/ConversationCard';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { StreamViewProps } from './types';
import { observer } from 'mobx-react';

type Props = WithNamespaces & StreamViewProps;
@observer
class StreamViewComponent extends Component<Props> {
  listRef: React.RefObject<HTMLElement> = React.createRef();

  componentDidMount() {
    this.props.fetchInitialPosts();
  }
  componentDidUpdate(prevProps: Props) {
    if (this.props.type !== prevProps.type) {
      this.props.fetchInitialPosts();
    }
  }

  render() {
    const { ids } = this.props;
    return (
      <JuiStream>
        <section ref={this.listRef}>
          {ids.map(id => (
            <ConversationCard id={id} key={id} mode="navigation" />
          ))}
        </section>
      </JuiStream>
    );
  }
}

const StreamView = translate('Conversations')(StreamViewComponent);

export { StreamView };
