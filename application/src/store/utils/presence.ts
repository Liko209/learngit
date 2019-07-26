/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-25 01:48:27
 * Copyright © RingCentral. All rights reserved.
 */
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import PresenceModel from '@/store/models/Presence';
import { Presence } from 'sdk/module/presence/entity';
import { PRESENCE } from 'sdk/module/presence/constant';
import { getEntity } from './entities';

function getPresence(uid: number) {
  if (uid === 0) {
    return PRESENCE.NOTREADY;
  }

  const person = getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, uid);

  if (person.deactivated) {
    return PRESENCE.NOTREADY;
  }

  const presence = getEntity<Presence, PresenceModel>(ENTITY_NAME.PRESENCE, uid).presence;

  return presence || PRESENCE.NOTREADY;
}

export { getPresence };
