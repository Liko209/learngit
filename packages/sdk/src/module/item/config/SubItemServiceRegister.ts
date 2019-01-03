/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:46:39
 * Copyright © RingCentral. All rights reserved.
 */

import { EventItemService } from '../module/event/service/EventItemService';
import { FileItemService } from '../module/file/service/FileItemService';
import { TaskItemService } from '../module/task/service/TaskItemService';
import { NoteItemService } from '../module/note/service/NoteItemService';
import { LinkItemService } from '../module/link/service/LinkItemService';
import { SubItemService } from '../module/base/service/SubItemService';
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
    const serviceMap: Map<number, SubItemService> = new Map();
    itemServiceConfigs.forEach((serviceInfo: ClassConfig) => {
      serviceMap.set(serviceInfo.typeId, serviceInfo.value());
    });
    return serviceMap;
  }
}

export { SubItemServiceRegister };
