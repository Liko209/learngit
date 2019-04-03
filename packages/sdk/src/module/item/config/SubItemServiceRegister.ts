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
  value: any;
};

const itemServiceConfigs: ClassConfig[] = [
  {
    typeId: TypeDictionary.TYPE_ID_FILE,
    value: FileItemService,
  },
  { typeId: TypeDictionary.TYPE_ID_TASK, value: TaskItemService },
  { typeId: TypeDictionary.TYPE_ID_PAGE, value: NoteItemService },
  { typeId: TypeDictionary.TYPE_ID_LINK, value: LinkItemService },
  { typeId: TypeDictionary.TYPE_ID_EVENT, value: EventItemService },
  { typeId: TypeDictionary.TYPE_ID_CODE, value: CodeItemService },
  { typeId: TypeDictionary.TYPE_ID_CONFERENCE, value: ConferenceItemService },
];

class SubItemServiceRegister {
  static buildSubItemServices() {
    const serviceMap: Map<number, ISubItemService> = new Map();
    itemServiceConfigs.forEach((serviceInfo: ClassConfig) => {
      serviceMap.set(serviceInfo.typeId, new serviceInfo.value());
    });
    return serviceMap;
  }
}

export { SubItemServiceRegister };
