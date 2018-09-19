/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import ConversationCard from '../ConversationCard';
import _ from 'lodash';

type ConversationStreamViewProps = {
  postIds: number[];
};

class ConversationStreamView extends PureComponent<
  ConversationStreamViewProps
> {
  render() {
    const { postIds } = this.props;
    return (
      <div>
        {postIds.map((id: number) => (
          <ConversationCard id={id} key={id} />
        ))}
      </div>
    );
  }
}

export { ConversationStreamView };
export default ConversationStreamView;
