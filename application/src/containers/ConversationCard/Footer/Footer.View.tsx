/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiConversationCardFooter } from 'jui/pattern/ConversationCard';
import { JuiConversationPostLike } from 'jui/pattern/ConversationPostLike';
import { JuiCollapse } from 'jui/components/Collapse';
import { FooterViewProps } from './types';

class FooterView extends Component<FooterViewProps> {
  render() {
    const {
      onToggleLike,
      iLiked,
      likedUsersCount,
      likedUsersNameMessage,
    } = this.props;

    return (
      <JuiCollapse
        mountOnEnter={true}
        unmountOnExit={true}
        in={Boolean(likedUsersCount)}
      >
        <JuiConversationCardFooter>
          <JuiConversationPostLike
            title={likedUsersNameMessage}
            onClick={onToggleLike}
            likedUsersCount={likedUsersCount}
            iLiked={iLiked}
          />
        </JuiConversationCardFooter>
      </JuiCollapse>
    );
  }
}

export { FooterView };
