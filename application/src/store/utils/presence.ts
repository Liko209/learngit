/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-25 01:48:27
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PresenceService } from 'sdk/module/presence';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import PresenceModel from '@/store/models/Presence';
import { Presence } from 'sdk/module/presence/entity';
import { PRESENCE } from 'sdk/module/presence/constant';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { JNetworkError, ERROR_CODES_NETWORK } from 'sdk/error';
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

async function setPresence(toPresence: PRESENCE) {
  const status = getGlobalValue(GLOBAL_KEYS.NETWORK);
  const id = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

  if (!!id && status === 'offline') {
    throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
  }

  const presenceService = ServiceLoader.getInstance<PresenceService>(
    ServiceConfig.PRESENCE_SERVICE,
  );

  await presenceService.setPresence(toPresence);
}

export { getPresence, setPresence };
