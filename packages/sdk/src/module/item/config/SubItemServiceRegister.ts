/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:46:39
 * Copyright © RingCentral. All rights reserved.
 */

import { EventItemService } from '../module/event/service';
import { FileItemService } from '../module/file/service';
import { TaskItemService } from '../module/task/service';
import { NoteItemService } from '../module/note/service';
import { LinkItemService } from '../module/link/service';
import { ISubItemService } from '../module/base/service';
import { TypeDictionary } from '../../../utils';
type ClassConfig = {
  typeId: number;
  value: any;
};

const itemServiceConfigs: ClassConfig[] = [
  { typeId: TypeDictionary.TYPE_ID_FILE, value: new FileItemService() },
  { typeId: TypeDictionary.TYPE_ID_TASK, value: new TaskItemService() },
  { typeId: TypeDictionary.TYPE_ID_PAGE, value: new NoteItemService() },
  { typeId: TypeDictionary.TYPE_ID_LINK, value: new LinkItemService() },
  { typeId: TypeDictionary.TYPE_ID_EVENT, value: new EventItemService() },
];

class SubItemServiceRegister {
  static buildSubItemServices() {
    const serviceMap: Map<number, ISubItemService> = new Map();
    itemServiceConfigs.forEach((serviceInfo: ClassConfig) => {
      serviceMap.set(serviceInfo.typeId, serviceInfo.value);
    });
    return serviceMap;
  }
}

export { SubItemServiceRegister };
