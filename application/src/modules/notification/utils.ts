import { ENTITY_NAME } from '@/store';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { PRESENCE } from 'sdk/module/presence/constant';
import { Presence } from 'sdk/module/presence/entity';
import PresenceModel from '@/store/models/Presence';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';

function getPresence() {
  const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  if (currentUserId !== 0) {
    const person = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      currentUserId,
    );
    if (person.deactivated) {
      return PRESENCE.NOTREADY;
    }
    return (
      getEntity<Presence, PresenceModel>(ENTITY_NAME.PRESENCE, currentUserId)
        .presence || PRESENCE.NOTREADY
    );
  }
  return PRESENCE.NOTREADY;
}

function isDND() {
  return getPresence() === PRESENCE.DND;
}

export { getPresence, isDND };
