/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ProfileService } from 'sdk/module/profile';
import { StateService, GroupState } from 'sdk/module/state';
import { Profile } from 'sdk/module/profile/entity';
import { getEntity, getSingleEntity, getGlobalValue } from '@/store/utils';
import { MenuProps, MenuViewProps } from './types';
import storeManager, { ENTITY_NAME } from '@/store';
import StoreViewModel from '@/store/ViewModel';
import GroupModel from '@/store/models/Group';
import ProfileModel from '@/store/models/Profile';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupStateModel from '@/store/models/GroupState';
import { Group } from 'sdk/module/group/entity';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class MenuViewModel extends StoreViewModel<MenuProps> implements MenuViewProps {
  private _profileService = ServiceLoader.getInstance<ProfileService>(
    ServiceConfig.PROFILE_SERVICE,
  );
  private _stateService = ServiceLoader.getInstance<StateService>(
    ServiceConfig.STATE_SERVICE,
  );
  @computed
  get personId() {
    return this.props.personId;
  }

  @computed
  get groupId() {
    return this.props.groupId;
  }

  @computed
  get anchorEl() {
    return this.props.anchorEl;
  }

  @computed
  get onClose() {
    return this.props.onClose;
  }

  @computed
  get open() {
    return !!this.anchorEl;
  }

  @computed
  get isFavorite() {
    return this._group.isFavorite;
  }

  @computed
  get favoriteText() {
    return this.isFavorite
      ? 'people.team.removeFromFavorites'
      : 'people.team.favorite';
  }

  @computed
  get shouldSkipCloseConfirmation() {
    return getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'skipCloseConversationConfirmation',
    );
  }

  @computed
  private get _groupState() {
    return getEntity<GroupState, GroupStateModel>(
      ENTITY_NAME.GROUP_STATE,
      this.groupId,
    );
  }

  @computed
  get closable() {
    return !(this._groupState.unreadCount || this.isFavorite);
  }

  @computed
  get isUnread() {
    const { unreadCount = 0 } = this._groupState;
    return unreadCount > 0;
  }

  @computed
  get disabledReadOrUnread() {
    const { mostRecentPostId } = this._group; // Not post message
    return !mostRecentPostId;
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.groupId);
  }

  toggleFavorite = () => {
    return this._profileService.markGroupAsFavorite(
      this.groupId,
      !this.isFavorite,
    );
  }

  closeConversation = (shouldSkipNextTime: boolean) => {
    return this._profileService.hideConversation(
      this.groupId,
      true,
      shouldSkipNextTime,
    );
  }

  toggleRead = async () => {
    const currentConversationId = getGlobalValue(
      GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
    );
    if (this.groupId === currentConversationId && !this.isUnread) {
      const globalStore = storeManager.getGlobalStore();
      globalStore.set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
    }
    await this._stateService.updateReadStatus(
      this.groupId,
      !this.isUnread,
      false,
    );
  }
}
export { MenuViewModel };
