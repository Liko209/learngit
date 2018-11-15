/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 10:09:31
 * Copyright © RingCentral. All rights reserved.
 */
import ItemModel from '../Item';

enum FileType {
  image = 0,
  document = 1,
  others = 2,
}

type FileItem = {
  type: string;
  downloadUrl: string;
  size: number;
  name: string;
  isDocument: boolean;
  isNew: boolean;
  url: string;
  pages: {
    file_id: number;
    url: string;
  }[];
  thumbs: any;
  origHeight: number;
  origWidth: number;
} & ItemModel;

type ExtendFileItem = {
  item: FileItem;
  type: number;
  previewUrl: string;
};

type LinkItem = {
  summary: string;
  title: string;
  url: string;
  image: string;
  deactivated: boolean;
  doNotRender: boolean;
} & ItemModel;

type EventItem = {
  color: string;
  description: string;
  start: number;
  end: number;
  location: string;
  repeat: string;
  repeatEnding: string;
  repeatEndingAfter: string;
  repeatEndingOn: string;
  text: string;
} & ItemModel;

type TaskItem = {
  color: string;
  complete: boolean;
  notes: string;
  start: number;
  end: number;
  section: string;
  repeat: string;
  repeatEnding: string;
  repeatEndingAfter: string;
  repeatEndingOn: string;
  text: string;
  due: number;
  completeType: string;
  assignedToIds: number[];
  attachmentIds: number[];
  completePeopleIds: number[];
  completePercentage: number;
} & ItemModel;

type NoteItem = {
  title: string;
  summary: string;
} & ItemModel;

export {
  FileItem,
  FileType,
  LinkItem,
  EventItem,
  TaskItem,
  NoteItem,
  ExtendFileItem,
};
