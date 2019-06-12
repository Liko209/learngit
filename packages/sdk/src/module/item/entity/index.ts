/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 13:35:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  ItemVersionPage,
  ItemVersions,
  Item,
  StoredFile,
} from '../module/base/entity';

import { TaskItem } from '../module/task/entity';
import { EventItem } from '../module/event/entity';
import { FileItem } from '../module/file/entity';
import { NoteItem } from '../module/note/entity';
import { LinkItem } from '../module/link/entity';
import { CodeItem } from '../module/code/entity';
import { IntegrationItem } from '../module/integration/entity';
import {
  InteractiveMessageItem,
  InteractiveMessageItemAttachment,
  InteractiveMessageItemAttachmentField,
} from '../module/interactiveMessage/entity';
import { MeetingItem } from '../module/meeting/entity';
export * from '../module/conference/entity';

type ItemFile = FileItem;

export {
  ItemVersionPage,
  ItemVersions,
  Item,
  TaskItem,
  EventItem,
  ItemFile,
  NoteItem,
  LinkItem,
  StoredFile,
  CodeItem,
  IntegrationItem,
  InteractiveMessageItem,
  InteractiveMessageItemAttachment,
  InteractiveMessageItemAttachmentField,
  MeetingItem,
};
