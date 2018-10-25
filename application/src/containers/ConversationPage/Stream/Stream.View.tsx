/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { ConversationCard } from '@/containers/ConversationCard';
import { StreamViewProps } from './types';

class StreamView extends PureComponent<StreamViewProps> {
  componentDidUpdate(prevProps: StreamViewProps) {
    if (!prevProps.postIds.length) {
      // initial scroll to bottom when switch to new group
      this.props.setRowVisible(-1);
    }
  }
  render() {
    return (
      <div>
        {this.props.postIds.map((id: number) => (
          <ConversationCard id={id} key={id} />
        ))}
      </div>
    );
  }
}

export { StreamView };
