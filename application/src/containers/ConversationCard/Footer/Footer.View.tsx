/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { WithPostLikeComponentProps } from './withPostLike/types';
import { JuiConversationCardFooter } from 'jui/pattern/ConversationCard';
import { JuiConversationPostLike } from 'jui/pattern/ConversationPostLike';
import { JuiCollapse } from 'jui/components/Collapse';
import { withPostLike } from './withPostLike';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { translate, WithNamespaces } from 'react-i18next';

@observer
class FooterViewComponent extends Component<
  WithPostLikeComponentProps & WithNamespaces
> {
  private _currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

  private get _likedUsersCount() {
    return this.props.likedUsers.length;
  }

  private get _likedUsersNameMessage() {
    if (!this._likedUsersCount) return '';

    const { t } = this.props;

    const usersName = this.props.likedUsers.reduce(
      (acc, { id, userDisplayName }) =>
        id === this._currentUserId
          ? [t('common.You'), ...acc]
          : [...acc, userDisplayName],
      [],
    );

    const lastUserName = usersName.pop();

    return usersName.length
      ? `${usersName.join(', ')}, and ${lastUserName} ${t('message.likeThis')}`
      : `${lastUserName} ${t('message.likeThis')}`;
  }

  render() {
    const { onToggleLike, iLiked } = this.props;

    return (
      <JuiCollapse
        mountOnEnter={true}
        unmountOnExit={true}
        in={Boolean(this._likedUsersCount)}
      >
        <JuiConversationCardFooter>
          <JuiConversationPostLike
            title={this._likedUsersNameMessage}
            onClick={onToggleLike}
            likedUsersCount={this._likedUsersCount}
            iLiked={iLiked}
          />
        </JuiConversationCardFooter>
      </JuiCollapse>
    );
  }
}

const FooterView = translate('translations')(withPostLike(FooterViewComponent));

export { FooterView };
