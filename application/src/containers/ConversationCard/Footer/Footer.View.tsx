/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { TComponentWithLikeProps } from './withPostLike/types';
import { JuiConversationCardFooter } from 'jui/pattern/ConversationCard';
import { JuiConversationPostLike } from 'jui/pattern/ConversationPostLike';
import { JuiCollapse } from 'jui/components/Collapse';
import { withPostLike } from './withPostLike';

@observer
class FooterViewComponent extends Component<TComponentWithLikeProps> {
  private _formatNames = (likedMembers: string[]) => {
    return likedMembers.length ? `${likedMembers.join(', ')} Liked this.` : '';
  }

  render() {
    const { likedMembers, iLiked, onToggleLike } = this.props;
    const likedCount = likedMembers.length;

    return (
      <JuiCollapse
        mountOnEnter={true}
        unmountOnExit={true}
        in={Boolean(likedCount)}
      >
        <JuiConversationCardFooter>
          <JuiConversationPostLike
            title={this._formatNames(likedMembers)}
            onClick={onToggleLike}
            likedCount={likedCount}
            iLiked={iLiked}
          />
        </JuiConversationCardFooter>
      </JuiCollapse>
    );
  }
}

const FooterView = withPostLike(FooterViewComponent);

export { FooterView };
