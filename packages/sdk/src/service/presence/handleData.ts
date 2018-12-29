/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import serviceManager from '../../service/serviceManager';
import PresenceService from '../../service/presence/index';
import notificationCenter from '../../service/notificationCenter';
import { ENTITY } from '../../service/eventKey';
import { Presence, RawPresence } from '../../module/presence/entity';

function transform(obj: RawPresence): Presence {
  const presence = obj.calculatedStatus;
  return {
    presence,
    id: obj.personId,
  };
}

const presenceHandleData = async (presences: RawPresence[]) => {
  if (presences.length === 0) {
    return;
  }
  const transformedData = ([] as RawPresence[])
    .concat(presences)
    .map(item => transform(item)) as Presence[];
  notificationCenter.emitEntityUpdate(ENTITY.PRESENCE, transformedData);
  const presenceService = serviceManager.getInstance(PresenceService);
  presenceService.saveToMemory(transformedData);
};

const handleStore = ({ state }: { state: any }) => {
  if (state === 'connected') {
    const presenceService = serviceManager.getInstance(PresenceService);
    presenceService.subscribeHandler.reset();
    notificationCenter.emitEntityReload(ENTITY.PRESENCE);
  } else if (state === 'disconnected') {
    notificationCenter.emitEntityReset(ENTITY.PRESENCE);
  }
};

export { presenceHandleData, handleStore };
