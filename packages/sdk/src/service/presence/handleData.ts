/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import serviceManager from '../../service/serviceManager';
import PresenceService from '../../service/presence/index';
import notificationCenter from '../../service/notificationCenter';
import { ENTITY } from '../../service/eventKey';
import { Presence, RawPresence } from '../../models';

function transform(obj: RawPresence) {
  return {
    id: obj.person_id,
    presence: obj.presence,
  };
}

const presenceHandleData = async (presences: RawPresence[]) => {
  if (presences.length === 0) {
    return;
  }
  const transformedData = presences.map(item => transform(item)) as Presence[];
  notificationCenter.emitEntityPut(ENTITY.PRESENCE, transformedData);
  const presenceService: PresenceService = serviceManager.getInstance(PresenceService);
  presenceService.saveToMemory(transformedData);
};

export default presenceHandleData;
