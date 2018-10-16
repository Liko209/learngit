/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import serviceManager from '../../service/serviceManager';
import PresenceService from '../../service/presence/index';
import notificationCenter from '../../service/notificationCenter';
import { ENTITY, SERVICE } from '../../service/eventKey';
import { Presence, RawPresence } from '../../models';

enum PresenceStatus {
  offline = 'offline',
  online = 'online',
  busy = 'busy',
}

const statusMap = {
  Unavailable: PresenceStatus.offline,
  Available: PresenceStatus.online,
  OnCall: PresenceStatus.busy,
  DND: PresenceStatus.busy,
};

function transform(obj: RawPresence): Presence {
  const presence = obj.calculatedStatus
    ? statusMap[obj.calculatedStatus]
    : 'offline';
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
    notificationCenter.emitEntityReload(ENTITY.PRESENCE);
  }
  if (state === 'disconnected') {
    notificationCenter.emitEntityReset(ENTITY.PRESENCE);
  }
};

export { presenceHandleData, handleStore };
