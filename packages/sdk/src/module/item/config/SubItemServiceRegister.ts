/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:46:39
 * Copyright © RingCentral. All rights reserved.
 */

import { FileItemService } from '../module/file';
import { EventItemService } from '../module/event/service';
import { TaskItemService } from '../module/task/service';
import { NoteItemService } from '../module/note/service';
import { LinkItemService } from '../module/link/service';
import { CodeItemService } from '../module/code/service';
import { ConferenceItemService } from '../module/conference/service';
import { ISubItemService } from '../module/base/service';
import { TypeDictionary } from '../../../utils';

type ClassConfig = {
  typeId: number;
  Value: any;
};

const itemServiceConfigs: ClassConfig[] = [
  {
    typeId: TypeDictionary.TYPE_ID_FILE,
    Value: FileItemService,
  },
  { typeId: TypeDictionary.TYPE_ID_TASK, Value: TaskItemService },
  { typeId: TypeDictionary.TYPE_ID_PAGE, Value: NoteItemService },
  { typeId: TypeDictionary.TYPE_ID_LINK, Value: LinkItemService },
  { typeId: TypeDictionary.TYPE_ID_EVENT, Value: EventItemService },
  { typeId: TypeDictionary.TYPE_ID_CODE, Value: CodeItemService },
  { typeId: TypeDictionary.TYPE_ID_CONFERENCE, Value: ConferenceItemService },
];

class SubItemServiceRegister {
  static buildSubItemServices() {
    const serviceMap: Map<number, ISubItemService> = new Map();
    itemServiceConfigs.forEach((serviceInfo: ClassConfig) => {
      serviceMap.set(serviceInfo.typeId, new serviceInfo.Value());
    });
    return serviceMap;
  }
}

export { SubItemServiceRegister };
