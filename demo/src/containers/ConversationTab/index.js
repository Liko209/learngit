import React from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { service } from 'sdk';
import storeManager, { ENTITY_NAME } from '#/store';
import ConversationTab from '#/components/ConversationTab';
import ConversationTabPresenter from '#/containers/ConversationTab/ConversationTabPresenter';
import { getGroupName } from '#/utils/groupName';
// parents component => components/ConversationSection/index

const { AccountService } = service;

export default withRouter(
  observer(props => {
    const conversationTabPresenter = new ConversationTabPresenter();
    const {
      id,
      history: {
        location: { pathname }
      }
    } = props;
    const userId = AccountService.getInstance().getCurrentUserId();
    const groupStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
    const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
    const groupStateStore = storeManager.getEntityMapStore(
      ENTITY_NAME.GROUP_STATE
    );
    const group = groupStore.get(id);
    const user = personStore.get(userId);
    const state = groupStateStore.get(id);
    const currentGroupId =
      typeof pathname === 'string'
        ? Number(pathname.substring(pathname.lastIndexOf('/') + 1))
        : null;
    const markAsRead = () => {
      // conversationTabPresenter.updateLastGroup(group.id);
      if (state.unread_count && state.unread_count > 0) {
        conversationTabPresenter.markAsRead(group.id);
      }
    };

    if (!group || (!group.isTeam && !Object.keys(user).length)) {
      return null;
    }
    const { isTeam, members, setAbbreviation } = group;
    const userIdIndex = members.indexOf(Number(user.id));
    const showPresence =
      !isTeam && (members.length === 1 || members.length === 2);
    const presenceId = showPresence
      ? members.length === 1
        ? userId
        : members[1 - userIdIndex]
      : 0;
    const title = isTeam ? setAbbreviation : getGroupName(members, userId);
    return (
      <ConversationTab
        {...props}
        group={group}
        user={user}
        markAsRead={markAsRead}
        currentGroupId={currentGroupId}
        state={state}
        title={title}
        presenceId={presenceId}
        showPresence={showPresence}
      />
    );
  })
);
