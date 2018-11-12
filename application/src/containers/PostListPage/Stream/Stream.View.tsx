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

type Props = WithNamespaces & StreamViewProps;

class StreamViewComponent extends Component<Props> {
  render() {
    const { postIds } = this.props;
    return (
      <JuiStream>
        <div>
          {postIds.length > 0
            ? postIds.map(id => <ConversationCard id={id} key={id} />)
            : null}
        </div>
      </JuiStream>
    );
  }
}

const StreamView = translate('Conversations')(StreamViewComponent);

export { StreamView };
