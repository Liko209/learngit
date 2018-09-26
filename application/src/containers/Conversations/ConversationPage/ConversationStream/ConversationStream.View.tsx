/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import ConversationCard from '../ConversationCard';
import { ConversationStreamViewProps } from './types';

class ConversationStreamView extends PureComponent<
  ConversationStreamViewProps
> {
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

export { ConversationStreamView };
export default ConversationStreamView;
