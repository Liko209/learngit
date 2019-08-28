/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-05 10:44:18
 * Copyright © RingCentral. All rights reserved.
 */

import { IMeetingController } from '../controller/IMeetingController';
import { StartMeetingResultType, MEETING_ACTION } from '../../types';
import { ZoomMeetingItem } from 'sdk/module/item/entity';
import { mainLogger } from 'foundation/log';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
import ItemAPI from 'sdk/api/glip/item';
import { ItemService } from 'sdk/module/item';

class ZoomDeepLinkController implements IMeetingController {
  async startMeeting(groupIds: number[]): Promise<StartMeetingResultType> {
    mainLogger.info('start zoom meeting, ', groupIds);

    try {
      const result = await this._requestToCreateMeeting(groupIds);
      if (result.start_url) {
        const itemService = ServiceLoader.getInstance<ItemService>(
          ServiceConfig.ITEM_SERVICE,
        );
        // do not await
        itemService.handleIncomingData([result]);
        return {
          action: MEETING_ACTION.DEEP_LINK,
          link: result.start_url,
        };
      }
      return {
        action: MEETING_ACTION.ERROR,
        reason: 'Request success but without start url',
      };
    } catch (e) {
      return {
        action: MEETING_ACTION.ERROR,
        reason: 'Request to start meeting failed',
      };
    }
  }

  cancelMeeting(itemId: number): Promise<void> {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );

    return itemService.cancelZoomMeeting(itemId);
  }

  async getJoinUrl(itemId: number): Promise<string> {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const model = (await itemService.getById(itemId)) as ZoomMeetingItem;
    return (model && model.join_url) || '';
  }

  private async _requestToCreateMeeting(groupIds: number[]) {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const person = await personService.getCurrentPerson();
    if (person) {
      const model: Partial<ZoomMeetingItem> = {
        email: person.email,
        first_name: personService.getFirstName(person),
        last_name: personService.getLastName(person),
        status: 'not_started',
        type_id: TypeDictionary.TYPE_ID_MEETING,
        group_ids: groupIds,
      };
      if (!groupIds.length) {
        model.no_post = true;
      }
      return ItemAPI.startZoomMeeting(model);
    }
    throw new Error('No User found');
  }
}

export { ZoomDeepLinkController };
