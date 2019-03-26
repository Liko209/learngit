/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { FooterViewModelProps } from './types';

class FooterViewModel extends StoreViewModel<FooterViewModelProps> {
  private _currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

  @computed
  get likedUsersCount() {
    return this.props.likedUsers.length;
  }

  @computed
  get likedUsersNameMessage() {
    if (!this.likedUsersCount) return '';

    const { t, iLiked } = this.props;

    const likeText =
      this.likedUsersCount === 1 && !iLiked
        ? `${t('common.verb.likes')} ${t('common.pronoun.this')}`
        : `${t('common.verb.like')} ${t('common.pronoun.this')}`;
    const andText =
      this.likedUsersCount > 2
        ? `, ${t('common.conj.and')}`
        : ` ${t('common.conj.and')}`;

    const usersName = this.props.likedUsers.reduce(
      (acc, { id, userDisplayName }) =>
        id === this._currentUserId
          ? [t('common.You'), ...acc]
          : [...acc, userDisplayName],
      [],
    );

    const lastUserName = usersName.pop();
    const suffix = `${lastUserName} ${likeText}`;

    return usersName.length
      ? `${usersName.join(', ')}${andText} ${suffix}`
      : suffix;
  }
}

export { FooterViewModel };
