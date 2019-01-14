/*
 * @Author: isaac.liu
 * @Date: 2019-01-11 15:30:28
 * Copyright © RingCentral. All rights reserved.
 */

import FilesEmptyImage from '../images/Files.svg';
import EventsEmptyImage from '../images/Events.svg';
import ImagesEmptyImage from '../images/Images.svg';
import IntegrationsEmptyImage from '../images/Integration.svg';
import LinksEmptyImage from '../images/Links.svg';
import NotesEmptyImage from '../images/Notes.svg';
import PinnedEmptyImage from '../images/Pinned.svg';
import TasksEmptyImage from '../images/Tasks.svg';
import { ITEM_LIST_TYPE } from '../types';

type EmptyConfig = {
  text: string;
  content: string;
  image: string;
};

type TabConfig = {
  title: string;
  type: ITEM_LIST_TYPE;
  empty: EmptyConfig;
};

const TAB_CONFIG: TabConfig[] = [
  {
    title: 'pinned',
    type: ITEM_LIST_TYPE.PIN,
    empty: {
      text: 'youHaveNothingPinnedYet',
      content: 'noPinSubText',
      image: PinnedEmptyImage,
    },
  },
  {
    title: 'files',
    type: ITEM_LIST_TYPE.FILE,
    empty: {
      text: 'noFilesSharedYet',
      content: 'noFileSubText',
      image: FilesEmptyImage,
    },
  },
  {
    title: 'images',
    type: ITEM_LIST_TYPE.IMAGE,
    empty: {
      text: 'noImagesSharedYet',
      content: 'noImageSubText',
      image: ImagesEmptyImage,
    },
  },
  {
    title: 'tasks',
    type: ITEM_LIST_TYPE.TASK,
    empty: {
      text: 'noTasksYet',
      content: 'noTaskSubText',
      image: TasksEmptyImage,
    },
  },
  {
    title: 'links',
    type: ITEM_LIST_TYPE.LINK,
    empty: {
      text: 'noLinksSharedYet',
      content: 'noLinkSubText',
      image: LinksEmptyImage,
    },
  },
  {
    title: 'notes',
    type: ITEM_LIST_TYPE.NOTE,
    empty: {
      text: 'noNotesCreatedYet',
      content: 'noNoteSubText',
      image: NotesEmptyImage,
    },
  },
  {
    title: 'events',
    type: ITEM_LIST_TYPE.EVENT,
    empty: {
      text: 'noEventsCreatedYet',
      content: 'noEventSubText',
      image: EventsEmptyImage,
    },
  },
  {
    title: 'integrations',
    type: ITEM_LIST_TYPE.INTEGRATION,
    empty: {
      text: 'noIntegrationInstallationYet',
      content: 'noIntegrationSubText',
      image: IntegrationsEmptyImage,
    },
  },
];

export { TAB_CONFIG, TabConfig, EmptyConfig };
