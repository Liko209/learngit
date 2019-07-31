import { ENTITY_NAME } from '@/store';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { Presence } from 'sdk/module/presence/entity';
import PresenceModel from '@/store/models/Presence';

function isCurrentUserDND() {
  const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  return getEntity<Presence, PresenceModel>(
    ENTITY_NAME.PRESENCE,
    currentUserId,
  ).isDND();
}

export { isCurrentUserDND };
