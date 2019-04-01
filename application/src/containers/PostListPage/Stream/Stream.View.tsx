/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 16:35:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import JuiConversationCard from 'jui/src/pattern/ConversationCard';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { StreamViewProps } from './types';
import { observer } from 'mobx-react';
import { ConversationPost } from '@/containers/ConversationPost';

type Props = WithNamespaces & StreamViewProps;
@observer
class StreamViewComponent extends Component<Props> {
  listRef: React.RefObject<HTMLElement> = React.createRef();
  private _jumpToPostRef: React.RefObject<
    JuiConversationCard
  > = React.createRef();
  render() {
    const { ids } = this.props;
    return (
      <JuiStream>
        <section ref={this.listRef}>
          {ids.map(id => (
            <ConversationPost
              id={id}
              key={`ConversationPost${id}`}
              cardRef={this._jumpToPostRef}
              mode="navigation"
            />
          ))}
        </section>
      </JuiStream>
    );
  }
}

const StreamView = translate('translations')(StreamViewComponent);

export { StreamView };
