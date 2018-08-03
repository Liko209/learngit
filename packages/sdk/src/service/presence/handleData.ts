/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import serviceManager from '../../service/serviceManager';
import PresenceService from '../../service/presence/index';
import notificationCenter from '../../service/notificationCenter';
import { ENTITY } from '../../service/eventKey';

export interface ITransform {
  person_id: number;
  presence: string;
}

function transform(obj: ITransform) {
  return {
    id: obj.person_id,
    presence: obj.presence,
  };
}

const presenceHandleData = async (presences: ITransform[]) => {
  if (presences.length === 0) {
    return;
  }
  const transformedData = presences.map(item => transform(item));
  notificationCenter.emitEntityPut(ENTITY.PRESENCE, transformedData);
  const presenceService = serviceManager.getInstance(PresenceService);
  presenceService.saveToMemory(transformedData);
};

export default presenceHandleData;
